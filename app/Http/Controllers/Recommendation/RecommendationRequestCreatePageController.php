<?php 

namespace App\Http\Controllers\Recommendation;

use App\Http\Controllers\Controller;
use App\Models\DepartmentUser;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class RecommendationRequestCreatePageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $department = DepartmentUser::where("user_id",$user->id)->with('department')->first();
        return Inertia::render('recommendation/create', [
            'employee_name'     => $user->name,
            'department'     => $department,
            'employee_code'     => "EMP00".$user->id,
            'now'               => now()->format('Y-m-d\TH:i'), // datetime-local format
        ]);
    }
}
