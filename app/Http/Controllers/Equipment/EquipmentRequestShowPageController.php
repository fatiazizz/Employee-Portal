<?php

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use App\Models\EquipmentRequest;
use App\Models\EquipmentBalance;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Http\Request;

class EquipmentRequestShowPageController extends Controller
{
    public function index(Request $request, $id)
    {
        $equipment = EquipmentRequest::with("user", "approver")->find($id);

        $user = $request->user();
        $user_id = $user->id;
        $isOwner = $equipment->user_id === $user_id;
        $isAdmin = $user->is_admin === 1;
        $isManager = $equipment->user && $equipment->user->manager_id === $user_id;
        if (!$isOwner && !$isManager && !$isAdmin) {
            abort(403, 'Access denied');
        }
        $stock = EquipmentBalance::get();

        return Inertia::render('equipment/show', [
            'data' => [
                'id'            => $equipment->id,
                'user_id'       => $equipment->user_id,
                'employeeName'  => $equipment->user->name ?? '',
                'employeeCode'  => 'EMP00' . ($equipment->user->id ?? ''),
                'items'         => $equipment->items ?? [],
                'created_at'    => Carbon::parse($equipment->created_at)->format('Y-m-d H:i:s'),
                'status'        => $equipment->status,
                'stock'       => $stock,
                'comment'       => $equipment->comment,
                'approver'      => $equipment->approver ? [
                    'id'    => $equipment->approver->id,
                    'name'  => $equipment->approver->name,
                    'email' => $equipment->approver->email,
                ] : null,
            ],
        ]);
    }
}
