<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;


class DepartemanListPageController extends Controller
{
    public function index(Request $request)
    {

        $users = User::where("is_manager", 1)->get();
        $datalist = Department::with('manager')->get();

        return Inertia::render('admin/department/index', [
            'departments' => $datalist,
            'users' => $users,
        ]);
    }
    public function create(Request $request)
    {

        $data = Department::create([
            "name"=> $request->name,
            "manager_id"=> $request->manager_id,
        ]);

         return response()->json(['message' => 'create successfully']);
    }

     public function setManager($id, Request $request)
    {
        $request->validate([
            'manager_id' => ['required', 'exists:users,id'],
        ]);

        $department = Department::findOrFail($id);
        $manager = User::findOrFail($request->manager_id);

        // به‌روزرسانی فیلد manager_id در جدول departments
        $department->manager_id = $manager->id;
        $department->save();

        return response()->json([
            'message' => 'Manager assigned successfully',
            'department' => $department->load('manager'),
        ]);
    }
    
}
