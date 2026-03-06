<?php 

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use Carbon\Carbon;

class LeaveStatusController extends Controller
{
    public function update($id, Request $request)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
        ]);

        $leave = LeaveRequest::findOrFail($id);
        $leave->status = $request->status;
        $leave->save();
        if ($request->status === 'rejected') {
            $start = Carbon::parse($leave->start_at);
            $end = Carbon::parse($leave->end_at);
            $requestedHours = $start->diffInHours($end);
            $balance = $leave->user->leaveBalance()->first();

            if ($balance) {
                $balance->used_hours -= $requestedHours; 
                $balance->save();
            }
        }

        return redirect()->back()->with('success', 'Leave status updated.');
    }
}
