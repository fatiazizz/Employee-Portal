<?php

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use App\Models\EquipmentRequest;
use App\Models\WarehouseItem;
use Illuminate\Http\Request;

class EquipmentRequestCreateController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_template_id' => ['required', 'integer', 'exists:product_templates,id'],
            'items.*.product_name' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        foreach ($validated['items'] as $item) {
            $available = (int) WarehouseItem::where('product_template_id', $item['product_template_id'])
                ->whereNull('recipient_id')
                ->sum('quantity');
            if ($available < $item['quantity']) {
                return response()->json([
                    'message' => 'Not enough stock for: '.$item['product_name'].' (available: '.$available.')',
                ], 422);
            }
        }

        $deviceRequest = EquipmentRequest::create([
            'user_id' => $user->id,
            'approver_id' => $user->manager_id,
            'items' => $validated['items'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Request submitted successfully.',
            'data' => $deviceRequest,
        ]);
    }
}
