<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EquipmentRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminProductRequestsPageController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user() || !$request->user()->is_admin) {
            abort(403, 'Only admin can view this page.');
        }

        $requests = EquipmentRequest::with('user')
            ->where('status', 'approved_by_manager')
            ->latest()
            ->get()
            ->map(function (EquipmentRequest $r) {
                return [
                    'id' => $r->id,
                    'employeeName' => $r->user->name ?? '',
                    'employeeCode' => 'EMP00' . ($r->user->id ?? ''),
                    'items' => $r->items ?? [],
                    'manager_approved_items' => $r->manager_approved_items ?? [],
                    'createdAt' => $r->created_at->format('Y-m-d H:i:s'),
                    'status' => $r->status,
                ];
            });

        return Inertia::render('admin/product-requests/index', [
            'requests' => $requests,
        ]);
    }
}
