<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\VehicleRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleRequestShowPageController extends Controller
{
    public function index(Request $request, $id)
    {
        $vehicle = VehicleRequest::with(['user', 'approver', 'vehicle', 'driver'])->findOrFail($id);

        $user = $request->user();
        $userId = $user->id;
        $isOwner = $vehicle->user_id === $userId;
        $isAdmin = (int) $user->is_admin === 1;
        $isManagerOfEmployee = $vehicle->user && $vehicle->user->manager_id === $userId;
        if (! $isOwner && ! $isManagerOfEmployee && ! $isAdmin) {
            abort(403, 'Access denied');
        }

        $canManagerAct = $vehicle->status === 'pending'
            && $vehicle->approver_id !== null
            && (int) $userId === (int) $vehicle->approver_id;

        $canAdminAct = $vehicle->status === 'manager_approved' && $isAdmin;

        [$allVehicles, $allDrivers] = $canAdminAct
            ? $this->resourcesAvailableForAssignment($vehicle)
            : [collect(), collect()];

        return Inertia::render('vehicle/show', [
            'data' => [
                'allVehicles' => $allVehicles->values()->all(),
                'allDrivers' => $allDrivers->values()->all(),
                'canManagerAct' => $canManagerAct,
                'canAdminAct' => $canAdminAct,
                'id' => $vehicle->id,
                'employeeName' => $vehicle->user->name ?? '',
                'employeeCode' => $vehicle->user ? 'EMP00'.$vehicle->user->id : '',
                'start_at' => $vehicle->start_at->format('Y-m-d H:i:s'),
                'end_at' => $vehicle->end_at->format('Y-m-d H:i:s'),
                'created_at' => $vehicle->created_at->format('Y-m-d H:i:s'),
                'status' => $vehicle->status,
                'comment' => $vehicle->comment,
                'vehicle' => $vehicle->vehicle ? [
                    'id' => $vehicle->vehicle->id,
                    'name' => $vehicle->vehicle->name,
                ] : null,
                'driver' => $vehicle->driver ? [
                    'id' => $vehicle->driver->id,
                    'name' => $vehicle->driver->name,
                ] : null,
                'approver' => $vehicle->approver ? [
                    'id' => $vehicle->approver->id,
                    'name' => $vehicle->approver->name,
                    'email' => $vehicle->approver->email,
                ] : null,
            ],
        ]);
    }

    /**
     * @return array{0: \Illuminate\Support\Collection, 1: \Illuminate\Support\Collection}
     */
    private function resourcesAvailableForAssignment(VehicleRequest $req): array
    {
        $busyVehicleIds = VehicleRequest::query()
            ->where('status', 'approved')
            ->where('id', '!=', $req->id)
            ->whereNotNull('vehicle_id')
            ->get()
            ->filter(fn (VehicleRequest $other) => $req->schedulingOverlaps($other))
            ->pluck('vehicle_id')
            ->unique()
            ->all();

        $busyDriverIds = VehicleRequest::query()
            ->where('status', 'approved')
            ->where('id', '!=', $req->id)
            ->whereNotNull('driver_id')
            ->get()
            ->filter(fn (VehicleRequest $other) => $req->schedulingOverlaps($other))
            ->pluck('driver_id')
            ->unique()
            ->all();

        $vehicles = Vehicle::query()
            ->where('is_active', true)
            ->when(
                count($busyVehicleIds) > 0,
                fn ($q) => $q->whereNotIn('id', $busyVehicleIds)
            )
            ->orderBy('name')
            ->get(['id', 'name']);

        $drivers = Driver::query()
            ->where('is_active', true)
            ->when(
                count($busyDriverIds) > 0,
                fn ($q) => $q->whereNotIn('id', $busyDriverIds)
            )
            ->orderBy('name')
            ->get(['id', 'name']);

        return [$vehicles, $drivers];
    }
}
