<?php

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EquipmentRequest;
use App\Models\EquipmentBalance;
use Carbon\Carbon;

class EquipmentRequestCreateController extends Controller
{
    public function store(Request $request)
    {
       $user = $request->user();

$validated = $request->validate([
    'items' => ['required', 'array', 'min:1'],
    'items.*.type' => ['required', 'string', 'in:case,monitor,mouse,keyboard,printer,cartridge'],
    'items.*.quantity' => ['required', 'integer', 'min:1'],
]);


        $deviceRequest = EquipmentRequest::create([
            'user_id'     => $user->id,
            'approver_id' => $user->manager_id,
            'items'       => $validated['items'],
            'status'      => 'pending',
        ]);

        return response()->json([
            'message' => 'Device request submitted successfully.',
            'data' => $deviceRequest,
        ]);
    }
}
