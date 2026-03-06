<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;


class VehicleListPageController extends Controller
{
    public function index(Request $request)
    {


        $datalist = Vehicle::get();


        return Inertia::render('admin/vehicles/index', [
            'vehicless' => $datalist,
        ]);
    }
    public function create(Request $request)
    {


        $data = Vehicle::create([
            "name" => $request->name,
            "plate_number" => $request->plate_number,
            "type" => $request->type,
        ]);

        return response()->json(['message' => 'create successfully']);
    }

    public function toggleStatus(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->is_active = $request->is_active;
        $vehicle->save();

        return response()->json(['message' => 'Status updated']);
    }
}
