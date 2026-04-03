<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleRequestCreatePageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $vehicles = Vehicle::where('is_active', true)->get(['id', 'name']);
        $drivers = Driver::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);
        $allUsers = User::get();

        return Inertia::render('vehicle/create', [
            'allUsers' => $allUsers,
            'employee_name' => $user->name,
            'employee_code' => 'EMP00'.$user->id,
            'now' => now()->format('Y-m-d\TH:i'),
            'vehicles' => $vehicles,
            'drivers' => $drivers,
        ]);
    }
}
