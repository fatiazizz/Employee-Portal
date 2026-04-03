<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\WarehouseItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseReportPageController extends Controller
{
    public function index(Request $request)
    {
        if (! $request->user() || ! $request->user()->is_admin) {
            abort(403, 'Only admin can view warehouse report.');
        }

        $departmentIds = $request->input('departments', []);
        if (! is_array($departmentIds)) {
            $departmentIds = array_filter([$departmentIds]);
        }
        $departmentIds = array_map('intval', array_filter($departmentIds));

        $query = WarehouseItem::with(['productTemplate', 'country', 'recipient', 'department'])
            ->orderBy('id');

        if (! empty($departmentIds)) {
            $query->whereIn('department_id', $departmentIds);
        }

        $items = $query->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'product_name' => $item->productTemplate->name ?? '',
                'category' => $item->productTemplate->category ?? '',
                'type' => $item->productTemplate->type ?? '',
                'serial_number' => $item->serial_number,
                'country' => $item->country->name ?? null,
                'production_date' => $item->production_date ? $item->production_date->format('Y-m-d') : null,
                'purchase_date' => $item->purchase_date->format('Y-m-d'),
                'registered_at' => $item->registered_at->format('Y-m-d'),
                'quantity' => $item->quantity,
                'recipient' => $item->recipient ? $item->recipient->name : null,
                'department' => $item->department ? $item->department->name : null,
                'delivery_date' => $item->delivery_date ? $item->delivery_date->format('Y-m-d') : null,
            ];
        });

        $departments = Department::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/warehouse/report', [
            'items' => $items,
            'departments' => $departments,
            'filterDepartments' => $departmentIds,
        ]);
    }
}
