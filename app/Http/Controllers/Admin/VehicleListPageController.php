<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleListPageController extends Controller
{
    public function index(Request $request)
    {
        $datalist = Vehicle::orderBy('name')->get();
        $maps = VehicleRequest::currentSchedulingAssignmentMaps();

        $vehicles = $datalist->map(function (Vehicle $vehicle) use ($maps) {
            $req = $maps['vehicles'][$vehicle->id] ?? null;

            return [
                'id' => $vehicle->id,
                'name' => $vehicle->name,
                'plate_number' => $vehicle->plate_number,
                'type' => $vehicle->type,
                'is_active' => $vehicle->is_active,
                'schedule_free' => $req === null,
                'trip_end_at' => $req?->end_at->format('Y-m-d H:i:s'),
                'assignable_after_at' => $req?->schedulingBusyEnd()->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('admin/vehicles/index', [
            'vehicles' => $vehicles,
        ]);
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'plate_number' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:255'],
        ]);

        Vehicle::create([
            'name' => $validated['name'],
            'plate_number' => $validated['plate_number'],
            'type' => $validated['type'] ?? null,
            'is_active' => false,
        ]);

        return response()->json(['message' => 'create successfully']);
    }

    public function update(Request $request, int $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        VehicleRequest::assertVehicleNotSchedulingBusy($vehicle->id);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'plate_number' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:255'],
        ]);
        $vehicle->update($validated);

        return response()->json(['message' => 'Vehicle updated']);
    }

    public function toggleStatus(Request $request, int $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        VehicleRequest::assertVehicleNotSchedulingBusy($vehicle->id);
        $vehicle->is_active = $request->boolean('is_active');
        $vehicle->save();

        return response()->json(['message' => 'Status updated']);
    }
}
