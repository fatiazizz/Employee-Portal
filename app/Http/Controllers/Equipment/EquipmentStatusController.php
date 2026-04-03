<?php

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use App\Models\EquipmentRequest;
use App\Models\WarehouseItem;
use Illuminate\Http\Request;

class EquipmentStatusController extends Controller
{
    public function update($id, Request $request)
    {
        $equipment = EquipmentRequest::with('user')->findOrFail($id);
        $user = $request->user();

        $isManager = $equipment->user && $equipment->user->manager_id === $user->id;
        $isAdmin = $user->is_admin === 1;

        if ($equipment->status === 'pending') {
            if (! $isManager) {
                return back()->withErrors(['status' => 'Only the department manager can approve or reject this request.']);
            }
            $validated = $request->validate([
                'status' => ['required', 'in:approved,rejected'],
                'manager_approved_items' => ['nullable', 'array'],
                'manager_approved_items.*' => ['integer', 'min:0'],
            ]);
            if ($validated['status'] === 'rejected') {
                $equipment->status = 'declined_by_manager';
                $equipment->comment = $request->input('comment');
                $equipment->save();

                return redirect()->back()->with('success', 'Request declined. No changes made.');
            }
            $managerApproved = $request->input('manager_approved_items', []);
            $items = $equipment->items ?? [];
            foreach ($items as $item) {
                $tid = $item['product_template_id'] ?? null;
                if ($tid === null) {
                    continue;
                }
                $qty = (int) ($managerApproved[(string) $tid] ?? $managerApproved[$tid] ?? 0);
                $requested = (int) ($item['quantity'] ?? 0);
                if ($qty > $requested) {
                    return back()->withErrors(['manager_approved_items' => 'Approved quantity cannot exceed requested quantity.']);
                }
            }
            $equipment->manager_approved_items = $managerApproved;
            $equipment->status = 'approved_by_manager';
            $equipment->comment = $request->input('comment');
            $equipment->save();

            return redirect()->back()->with('success', 'Request approved. Sent to admin for final approval.');
        }

        if ($equipment->status === 'approved_by_manager') {
            if (! $isAdmin) {
                return back()->withErrors(['status' => 'Only admin can perform final approval or rejection.']);
            }
            $validated = $request->validate([
                'status' => ['required', 'in:final_approval,final_rejection'],
                'admin_delivery_items' => ['nullable', 'array'],
                'admin_delivery_items.*' => ['integer', 'min:0'],
            ]);
            if ($validated['status'] === 'final_rejection') {
                $equipment->status = 'admin_rejected';
                $equipment->admin_approver_id = $user->id;
                $equipment->comment = $request->input('comment');
                $equipment->save();

                return redirect()->back()->with('success', 'Request rejected by admin.');
            }
            $adminDelivery = $request->input('admin_delivery_items', []);
            $items = $equipment->items ?? [];
            foreach ($items as $item) {
                $tid = $item['product_template_id'] ?? null;
                if ($tid === null) {
                    continue;
                }
                $deliveryQty = (int) ($adminDelivery[(string) $tid] ?? $adminDelivery[$tid] ?? 0);
                if ($deliveryQty <= 0) {
                    continue;
                }
                $inventory = (int) WarehouseItem::where('product_template_id', $tid)->whereNull('recipient_id')->sum('quantity');
                $managerApprovedQty = (int) (($equipment->manager_approved_items ?? [])[(string) $tid] ?? 0);
                if ($deliveryQty > $inventory || $deliveryQty > $managerApprovedQty) {
                    return back()->withErrors([
                        'admin_delivery_items' => 'Final approved quantity cannot exceed inventory ('.$inventory.') or manager-approved amount ('.$managerApprovedQty.').',
                    ]);
                }
            }
            $requester = $equipment->user;
            $departmentId = null;
            if ($requester) {
                $du = \App\Models\DepartmentUser::where('user_id', $requester->id)->first();
                if ($du) {
                    $departmentId = $du->department_id;
                }
            }
            $today = now()->format('Y-m-d');
            foreach ($items as $item) {
                $tid = $item['product_template_id'] ?? null;
                if ($tid === null) {
                    continue;
                }
                $deliveryQty = (int) ($adminDelivery[(string) $tid] ?? $adminDelivery[$tid] ?? 0);
                if ($deliveryQty <= 0) {
                    continue;
                }
                $rows = WarehouseItem::with('productTemplate')
                    ->where('product_template_id', $tid)
                    ->whereNull('recipient_id')
                    ->orderBy('id')
                    ->get();
                $remaining = $deliveryQty;
                foreach ($rows as $row) {
                    if ($remaining <= 0) {
                        break;
                    }
                    $take = min($remaining, $row->quantity);
                    if ($take <= 0) {
                        continue;
                    }
                    if ($take >= $row->quantity) {
                        $row->recipient_id = $equipment->user_id;
                        $row->department_id = $departmentId;
                        $row->delivery_date = $today;
                        $row->save();
                        $remaining -= $take;
                    } else {
                        $row->quantity -= $take;
                        $row->save();
                        $newId = WarehouseItem::nextIdForType($row->productTemplate->type);
                        WarehouseItem::create([
                            'id' => $newId,
                            'product_template_id' => $row->product_template_id,
                            'serial_number' => $row->serial_number,
                            'country_id' => $row->country_id,
                            'production_date' => $row->production_date,
                            'purchase_date' => $row->purchase_date,
                            'registered_at' => $row->registered_at,
                            'quantity' => $take,
                            'recipient_id' => $equipment->user_id,
                            'department_id' => $departmentId,
                            'delivery_date' => $today,
                        ]);
                        $remaining -= $take;
                    }
                }
            }
            $equipment->admin_delivery_items = $adminDelivery;
            $equipment->status = 'final_approved';
            $equipment->admin_approver_id = $user->id;
            $equipment->save();

            return redirect()->back()->with('success', 'Request finally approved. Inventory updated and ownership recorded.');
        }

        return back()->withErrors(['status' => 'Request already processed.']);
    }
}
