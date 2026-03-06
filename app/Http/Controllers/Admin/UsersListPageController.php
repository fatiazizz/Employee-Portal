<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;


class UsersListPageController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = $request->user();

        if (!$currentUser->is_admin) {
            abort(403, 'Access denied');
        }

        // گرفتن همه کاربران (به جز مدیر اصلی)
        $users = User::withCount([
    'leaveRequests',
    'vehicleRequests',
    'recommendationRequests',
    'equipmentRequests',
])->with([
    'leaveRequests' => fn($q) => $q->latest()->limit(1),
    'vehicleRequests' => fn($q) => $q->latest()->limit(1),
    'recommendationRequests' => fn($q) => $q->latest()->limit(1),
    'equipmentRequests' => fn($q) => $q->latest()->limit(1),
])->get();

        $userList = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'code' => 'EMP00' . $user->id,
                'email' => $user->email,
                'leave_count' => $user->leave_requests_count,
                'vehicle_count' => $user->vehicle_requests_count,
                'recommendation_count' => $user->recommendation_requests_count,
                'equipment_count' => $user->equipment_requests_count,
                'last_leave' => optional($user->leaveRequests->first())->created_at?->format('Y-m-d'),
                'last_vehicle' => optional($user->vehicleRequests->first())->created_at?->format('Y-m-d'),
                'last_recommendation' => optional($user->recommendationRequests->first())->created_at?->format('Y-m-d'),
                'last_equipment' => optional($user->equipmentRequests->first())->created_at?->format('Y-m-d'),
            ];
        });

        return Inertia::render('admin/users/index', [
            'users' => $userList,
        ]);
    }
}
