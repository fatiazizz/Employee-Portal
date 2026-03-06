<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EquipmentBalance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;


class WarehouseListPageController extends Controller
{
    public function index(Request $request)
    {


        $datalist = EquipmentBalance::get();


        return Inertia::render('admin/warehouse/index', [
            'warehouses' => $datalist,
        ]);
    }
    public function create(Request $request)
    {


        $data = EquipmentBalance::create([
            "type"=> $request->type,
            "quantity"=> $request->quantity
        ]);

         return response()->json(['message' => 'create successfully']);
    }

    public function updateQuantity($id, Request $request)
{
    $request->validate([
        'quantity' => 'required|numeric|min:0',
    ]);

    $warehouse = EquipmentBalance::findOrFail($id);
    $warehouse->quantity = $request->input('quantity');
    $warehouse->save();

    return response()->json(['message' => 'Quantity updated.']);
}
    
}
