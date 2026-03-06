<?php

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use App\Models\LeaveBalance;
use Carbon\Carbon;

class LeaveRequestCreateController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'type' => 'required',
            'start_at' => ['required', 'date'],
            'end_at'   => ['required', 'date', 'after:start_at'],
            'total_days' => ['nullable', 'numeric'], // optional for daily

        ]);

        // Calculate leave duration in hours
        $type = $validated['type'];
        $start = Carbon::parse($validated['start_at']);
        $end = Carbon::parse($validated['end_at']);
        if ($type === 'daily') {
            // برای مرخصی روزانه هر روز ۸ ساعت
            $days = $validated['total_days'] ?? $start->diffInDays($end) + 1;
            $requestedHours = $days * 8;
        } else {
            // مرخصی ساعتی دقیق بین start و end
            $requestedHours = $start->floatDiffInRealHours($end);
        }


        // Get user's leave balance
        $leaveBalance = $user->leaveBalance()->first();

        if (!$leaveBalance) {
            return response()->json([
                'message' => 'Leave balance is not defined for this user.'
            ], 422);
        }
       
        if ($requestedHours > $leaveBalance->remaining_hours) {
            return response()->json([
                'message' => 'Requested leave exceeds available balance.',
                'remaining_hours' => $leaveBalance->remaining_hours,
                'requested_hours' => $requestedHours,
            ], 422);
        }

        // Create leave request
        $leaveRequest = LeaveRequest::create([
            'user_id'     => $user->id,
            'approver_id' => $user->manager_id,
            'start_at'    => $start,
            'end_at'      => $end,
            'type'      => $type,
            'status'      => 'pending',
        ]);

        // Decrease remaining hours
        $leaveBalance->increment('used_hours', $requestedHours);

        return response()->json([
            'message' => 'Leave request submitted successfully.',
            'data' => $leaveRequest
        ]);
    }
}
