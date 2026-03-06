<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\DepartmentUser;
use App\Models\LeaveBalance;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ManagerUsersShowPageController extends Controller
{
    public function show($id)
    {
        $user = User::with('manager','leaveBalance','department')->findOrFail($id);
        $allUsers = User::where("is_manager",1)->select('id', 'name')->get();
        $departeman = Department::get();

        return Inertia::render('manager/users/show', [
            'user' => $user,
            'departeman' => $departeman,
            'allUsers' => $allUsers, // برای انتخاب مدیر جدید
        ]);
    }
   



}
