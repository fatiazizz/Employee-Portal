<?php 

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LeaveRequestShowPageController extends Controller
{
    public function index(Request $request,$id)
    {
         $leave = LeaveRequest::with("user","approver")->find($id);

               $user = $request->user();
        $user_id = $user->id;
        $isOwner = $leave->user_id === $user_id;
        $isAdmin = $user->is_admin ===1;
        $isApprover = $leave->approver_id === $user_id;
        $isManager = $leave->user && $leave->user->manager_id === $user_id;
        if (!$isOwner && !$isApprover && !$isManager && !$isAdmin) {
            abort(403, 'Access denied');
        }

         return Inertia::render('leave/show', [
            'data' => [
                'id' => $leave->id,
                'user_id' => $leave->user_id,
                'employeeName' => $leave->user->name ?? '',
                'employeeCode' => 'EMP00' . $leave->user->id ?? '',
                'start_at' => Carbon::parse($leave->start_at)->format('Y-m-d H:i:s'),
                'end_at' => Carbon::parse($leave->end_at)->format('Y-m-d H:i:s'),
                'created_at' => Carbon::parse($leave->created_at)->format('Y-m-d H:i:s'),
                'status' => $leave->status,
                'type' => $leave->type,
                'comment' => $leave->comment,
                'approver' => $leave->approver ? [
                    'id' => $leave->approver->id,
                    'name' => $leave->approver->name,
                    'email' => $leave->approver->email,
                ] : null,
            ],
        ]);
    }
}
