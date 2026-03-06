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


        $datalist = Department::get();

        return Inertia::render('admin/department/index', [
            'departments' => $datalist,
        ]);
    }
    public function create(Request $request)
    {


        $data = Department::create([
            "name"=> $request->name
        ]);

         return response()->json(['message' => 'create successfully']);
    }

    
}
