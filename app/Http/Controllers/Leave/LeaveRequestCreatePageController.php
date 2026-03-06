<?php 

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class LeaveRequestCreatePageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $balance = $user->leaveBalance()->first();

        return Inertia::render('leave/create', [
            'employee_name'     => $user->name,
            'employee_code'     => "EMP00".$user->id,
            'remaining_hours'   => $balance ? $balance->remaining_hours : 0,
            'year'              => $balance ? $balance->year : now()->year,
            'now'               => now()->format('Y-m-d\TH:i'), // datetime-local format
        ]);
    }
}
