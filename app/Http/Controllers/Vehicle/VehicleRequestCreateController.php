<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\VehicleRequest;
use Carbon\Carbon;

class VehicleRequestCreateController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'start_at'     => ['required', 'date'],
            'end_at'       => ['required', 'date', 'after:start_at'],
            'origin'       => ['required', 'string', 'max:255'],
            'destination'  => ['required', 'string', 'max:255'],
            'companions'   => ['nullable', 'array', 'max:3'],
            'companions.*' => ['exists:users,id'],
        ]);

        $start = Carbon::parse($validated['start_at']);
        $end = Carbon::parse($validated['end_at']);

        $vehicleRequest = VehicleRequest::create([
            'user_id'     => $user->id,
            'approver_id' => $user->manager_id,
            'start_at'    => $start,
            'end_at'      => $end,
            'origin'      => $validated['origin'],
            'destination' => $validated['destination'],
            'companions'  => $validated['companions'] ?? [],
            'status'      => 'pending',
        ]);

        return response()->json([
            'message' => 'Vehicle request submitted successfully.',
            'data' => $vehicleRequest,
        ]);
    }
}
