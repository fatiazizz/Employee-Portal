<?php 

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\User;

class VehicleRequestCreatePageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $vehicles = Vehicle::where('is_active', true)->get(['id', 'name']);
        $drivers  = Driver::get()->map(function ($driver) {
            return [
                'id'   => $driver->id,
                'name' => $driver->name,
            ];
        });
        $allUsers = User::get();
        return Inertia::render('vehicle/create', [
            'allUsers' => $allUsers,
            'employee_name' => $user->name,
            'employee_code' => "EMP00" . $user->id,
            'now'           => now()->format('Y-m-d\TH:i'),
            'vehicles'      => $vehicles,
            'drivers'       => $drivers,
        ]);
    }
}
