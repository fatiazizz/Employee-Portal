<?php

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EquipmentRequest;
use App\Models\EquipmentBalance;
use Illuminate\Support\Facades\DB;

class EquipmentStatusController extends Controller
{
    public function update($id, Request $request)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'approved_items' => ['nullable', 'array'],
            'approved_items.*' => ['integer', 'min:0'],
        ]);

        $equipment = EquipmentRequest::findOrFail($id);

        if ($equipment->status !== 'pending') {
            return back()->withErrors(['status' => 'Request already processed.']);
        }

        if ($validated['status'] === 'approved') {
            if (!$request->has('approved_items') || empty($request->approved_items)) {
                return back()->withErrors(['approved_items' => 'Approved items are required for approval.']);
            }

            $approvedItems = $request->approved_items;
            $items = $equipment->items; // array of ['type' => ..., 'quantity' => ..., 'stock' => ...]

            foreach ($items as $item) {
                $type = $item['type'];
                $approvedQty = $approvedItems[$type] ?? 0;

                $stock = EquipmentBalance::where('type', $type)->first();

                if (!$stock || $stock->quantity < $approvedQty) {
                    return response()->json([
                        'message' => "Not enough stock for item: {$type}"
                    ], 422);
                }


                $stock->quantity -= $approvedQty;
                $stock->save();
            }

            // به‌روزرسانی items با مقدار تاییدشده
            $updatedItems = [];

            foreach ($items as $item) {
                $type = $item['type'];
                $approvedQty = $approvedItems[$type] ?? 0;

                // فقط آیتم‌هایی که تایید شدند نگه‌دار
                if ($approvedQty > 0) {
                    $updatedItems[] = [
                        'type' => $type,
                        'quantity' => $approvedQty,
                    ];
                }
            }

            $equipment->items = $updatedItems;
            $equipment->approved_items = $approvedItems;
            $equipment->status = 'approved';
            $equipment->save();
            return response()->json([
            'message' => 'request approved successfully.',
            'data' => $equipment,
            ]);
        }

        // اگر رد شد فقط وضعیت تغییر کند
        $equipment->status = 'rejected';
        $equipment->save();

        return redirect()->back()->with('success', 'Request rejected.');
    }
}
