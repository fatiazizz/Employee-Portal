<?php 

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use Carbon\Carbon;

class LeaveRequestPageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

    $query = LeaveRequest::query()
        ->with(['user']);

    // فقط اگر ادمین نباشد، فیلتر خاص اعمال شود
    if (!$user->is_admin) {
        $query->where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhere('approver_id', $user->id);
        });
    }

    

        $leaveRequests = $query->latest()->get()->map(function ($leave) {
            return [
                'id' => $leave->id,
                'employeeName' => $leave->user->name,
                'employeeCode' => "EMP00". $leave->user->id,
                'startDate' => Carbon::parse($leave->start_at)->format('Y-m-d H:i:s'),
                'endDate' => Carbon::parse($leave->end_at)->format('Y-m-d H:i:s'),
                'status' => $leave->status,
            ];
        });

        return Inertia::render('leave/index', [
            'leaveRequests' => $leaveRequests,
        ]);
    }
}
