<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\VehicleRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DriverListPageController extends Controller
{
    public function index(Request $request)
    {
        $datalist = Driver::orderBy('name')->get();
        $maps = VehicleRequest::currentSchedulingAssignmentMaps();

        $drivers = $datalist->map(function (Driver $driver) use ($maps) {
            $req = $maps['drivers'][$driver->id] ?? null;

            return [
                'id' => $driver->id,
                'name' => $driver->name,
                'license_number' => $driver->license_number,
                'phone' => $driver->phone,
                'is_active' => $driver->is_active,
                'schedule_free' => $req === null,
                'trip_end_at' => $req?->end_at->format('Y-m-d H:i:s'),
                'assignable_after_at' => $req?->schedulingBusyEnd()->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('admin/driver/index', [
            'drivers' => $drivers,
        ]);
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
        ]);

        Driver::create([
            'name' => $validated['name'],
            'license_number' => $validated['license_number'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'is_active' => false,
        ]);

        return response()->json(['message' => 'create successfully']);
    }

    public function update(Request $request, int $id)
    {
        $driver = Driver::findOrFail($id);
        VehicleRequest::assertDriverNotSchedulingBusy($driver->id);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
        ]);
        $driver->update($validated);

        return response()->json(['message' => 'Driver updated']);
    }

    public function toggleStatus(int $id)
    {
        $driver = Driver::findOrFail($id);
        VehicleRequest::assertDriverNotSchedulingBusy($driver->id);
        $driver->is_active = ! $driver->is_active;
        $driver->save();

        return response()->json(['message' => 'Driver status updated']);
    }
}
