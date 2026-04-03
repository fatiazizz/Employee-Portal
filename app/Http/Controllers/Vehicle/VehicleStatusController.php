<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\VehicleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class VehicleStatusController extends Controller
{
    public function update(int $id, Request $request): JsonResponse
    {
        $vehicleRequest = VehicleRequest::with('user')->findOrFail($id);
        $user = $request->user();
        $isAdmin = (bool) $user->is_admin;

        if ($vehicleRequest->status === 'pending') {
            return $this->handleManagerStep($request, $vehicleRequest, $user, $isAdmin);
        }

        if ($vehicleRequest->status === 'manager_approved') {
            return $this->handleAdminStep($request, $vehicleRequest, $isAdmin);
        }

        abort(403, 'This request can no longer be updated.');
    }

    private function handleManagerStep(Request $request, VehicleRequest $vehicleRequest, $user, bool $isAdmin): JsonResponse
    {
        if ((int) $user->id !== (int) $vehicleRequest->approver_id) {
            abort(403, 'Only the employee\'s direct manager can approve or decline at this stage.');
        }

        $validated = $request->validate([
            'status' => ['required', 'in:manager_approved,rejected'],
        ]);

        if ($validated['status'] === 'rejected') {
            $vehicleRequest->update([
                'status' => 'rejected',
                'vehicle_id' => null,
                'driver_id' => null,
            ]);

            return response()->json([
                'message' => 'Vehicle request declined.',
                'status' => $vehicleRequest->fresh()->status,
            ]);
        }

        $vehicleRequest->update([
            'status' => 'manager_approved',
        ]);

        return response()->json([
            'message' => 'Approved by manager. An administrator will assign a vehicle and driver.',
            'status' => $vehicleRequest->fresh()->status,
        ]);
    }

    private function handleAdminStep(Request $request, VehicleRequest $vehicleRequest, bool $isAdmin): JsonResponse
    {
        if (! $isAdmin) {
            abort(403, 'Only an administrator can assign resources at this stage.');
        }

        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
        ]);

        if ($validated['status'] === 'rejected') {
            $vehicleRequest->update([
                'status' => 'rejected',
                'vehicle_id' => null,
                'driver_id' => null,
            ]);

            return response()->json([
                'message' => 'Vehicle request rejected.',
                'status' => $vehicleRequest->fresh()->status,
            ]);
        }

        $assignment = $request->validate([
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'driver_id' => ['required', 'exists:drivers,id'],
        ]);

        $vehicle = Vehicle::findOrFail($assignment['vehicle_id']);
        $driver = Driver::findOrFail($assignment['driver_id']);

        if (! $vehicle->is_active || ! $driver->is_active) {
            throw ValidationException::withMessages([
                'vehicle_id' => ['Selected vehicle and driver must be active in the fleet list.'],
            ]);
        }

        $vehicleRequest->assertResourcesAvailableForAssignment(
            (int) $assignment['vehicle_id'],
            (int) $assignment['driver_id']
        );

        $vehicleRequest->update([
            'status' => 'approved',
            'vehicle_id' => $assignment['vehicle_id'],
            'driver_id' => $assignment['driver_id'],
        ]);

        return response()->json([
            'message' => 'Vehicle request approved and resources assigned.',
            'status' => $vehicleRequest->fresh()->status,
        ]);
    }
}
