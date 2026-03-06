<?php 
namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\VehicleRequest;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\Driver;

class VehicleRequestShowPageController extends Controller
{
    public function index(Request $request,$id)
    {
        $vehicle = VehicleRequest::with(['user', 'approver', 'vehicle', 'driver'])->findOrFail($id);

                                $user = $request->user();
        $user_id = $user->id;
        $isOwner = $vehicle->user_id === $user_id;
        $isAdmin = $user->is_admin ===1;
        $isManager = $vehicle->user && $vehicle->user->manager_id === $user_id;
        if (!$isOwner && !$isManager && !$isAdmin) {
            abort(403, 'Access denied');
        }
       $vehicles = Vehicle::where('is_active', true)->get(['id', 'name']);
        $drivers  = Driver::where('is_active', true)->get();
        
        return Inertia::render('vehicle/show', [

            'data' => [
                'allVehicles'      => $vehicles,
            'allDrivers'       => $drivers,
                'id'            => $vehicle->id,
                'employeeName'  => $vehicle->user->name ?? '',
                'employeeCode'  => 'EMP00' . $vehicle->user->id ?? '',
                'start_at'      => $vehicle->start_at->format('Y-m-d H:i:s'),
                'end_at'        => $vehicle->end_at->format('Y-m-d H:i:s'),
                'created_at'    => $vehicle->created_at->format('Y-m-d H:i:s'),
                'status'        => $vehicle->status,
                'comment'       => $vehicle->comment,
                'vehicle'       => $vehicle->vehicle ? [
                    'id' => $vehicle->vehicle->id,
                    'name' => $vehicle->vehicle->name,
                ] : null,
                'driver'        => $vehicle->driver ? [
                    'id' => $vehicle->driver->id,
                    'name' =>  $vehicle->driver ? $vehicle->driver->name : '-',
                ] : null,
                'approver'      => $vehicle->approver ? [
                    'id' => $vehicle->approver->id,
                    'name' => $vehicle->approver->name,
                    'email' => $vehicle->approver->email,
                ] : null,
            ],
        ]);
    }
}
