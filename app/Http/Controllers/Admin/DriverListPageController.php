<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;


class DriverListPageController extends Controller
{
    public function index(Request $request)
    {


        $datalist = Driver::get();


        return Inertia::render('admin/driver/index', [
            'drivers' => $datalist,
        ]);
    }
    public function create(Request $request)
    {

        $data = Driver::create([
            "name"=> $request["name"],
            "license_number"=> $request["license_number"],
            "phone"=> $request["phone"],
        ]);

         return response()->json(['message' => 'create successfully']);
    }

    public function toggleStatus($id)
{
    $driver = Driver::findOrFail($id);
    $driver->is_active = !$driver->is_active;
    $driver->save();

    return response()->json(['message' => 'Driver status updated']);
}

}
