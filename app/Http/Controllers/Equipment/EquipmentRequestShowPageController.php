<?php

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use App\Models\EquipmentRequest;
use App\Models\WarehouseItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EquipmentRequestShowPageController extends Controller
{
    public function index(Request $request, $id)
    {
        $equipment = EquipmentRequest::with('user', 'approver', 'adminApprover')->findOrFail($id);

        $user = $request->user();
        $user_id = $user->id;
        $isOwner = $equipment->user_id === $user_id;
        $isAdmin = $user->is_admin === 1;
        $isManager = $equipment->user && $equipment->user->manager_id === $user_id;
        if (!$isOwner && !$isManager && !$isAdmin) {
            abort(403, 'Access denied');
        }

        $items = $equipment->items ?? [];
        $inventoryByTemplate = [];
        foreach ($items as $item) {
            $tid = $item['product_template_id'] ?? null;
            if ($tid === null) {
                continue;
            }
            if (!isset($inventoryByTemplate[$tid])) {
                $inventoryByTemplate[$tid] = (int) WarehouseItem::where('product_template_id', $tid)
                    ->whereNull('recipient_id')
                    ->sum('quantity');
            }
        }

        $canManagerAct = $equipment->status === 'pending' && $isManager;
        $canAdminAct = $equipment->status === 'approved' && $isAdmin;

        return Inertia::render('equipment/show', [
            'data' => [
                'id' => $equipment->id,
                'user_id' => $equipment->user_id,
                'employeeName' => $equipment->user->name ?? '',
                'employeeCode' => 'EMP00' . ($equipment->user->id ?? ''),
                'items' => $items,
                'manager_approved_items' => $equipment->manager_approved_items ?? [],
                'admin_delivery_items' => $equipment->admin_delivery_items ?? [],
                'created_at' => Carbon::parse($equipment->created_at)->format('Y-m-d H:i:s'),
                'status' => $equipment->status,
                'inventoryByTemplate' => $inventoryByTemplate,
                'comment' => $equipment->comment,
                'approver' => $equipment->approver ? [
                    'id' => $equipment->approver->id,
                    'name' => $equipment->approver->name,
                    'email' => $equipment->approver->email,
                ] : null,
                'adminApprover' => $equipment->adminApprover ? [
                    'id' => $equipment->adminApprover->id,
                    'name' => $equipment->adminApprover->name,
                ] : null,
                'canManagerAct' => $canManagerAct,
                'canAdminAct' => $canAdminAct,
                'isManager' => $isManager,
                'isAdmin' => $isAdmin,
            ],
        ]);
    }
}
