<?php

namespace App\Http\Controllers;

use App\Models\EquipmentRequest;
use App\Models\LeaveRequest;
use App\Models\RecommendationRequest;
use App\Models\VehicleRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->is_admin;

        $leave = LeaveRequest::where('approver_id', $user->id)->where('status', 'pending')->count();
        $vehicle = $isAdmin
            ? VehicleRequest::where('status', 'manager_approved')->count()
            : VehicleRequest::where('approver_id', $user->id)->where('status', 'pending')->count();
        $recommendation = RecommendationRequest::where('approver_id', $user->id)->where('status', 'pending')->count();
        $equipment = EquipmentRequest::where('approver_id', $user->id)->where('status', 'pending')->count();

        $leaveRequests = LeaveRequest::with('user')->
        when(
            ! $isAdmin,
            fn ($q) => $q->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('approver_id', $user->id);
            })
        )
            ->latest()->take(5)->get()->map(function ($r) {
                return [
                    'id' => $r->id,
                    'type' => 'Leave',
                    'url' => 'leave',
                    'employeeName' => $r->user->name ?? '',
                    'employeeCode' => 'EMP00'.($r->user->id ?? ''),
                    'CreateDate' => Carbon::parse($r->created_at)->format('Y-m-d H:i:s'),

                    'status' => $r->status,
                ];
            });

        $vehicleRequests = VehicleRequest::with('user')
            ->when(! $isAdmin, fn ($q) => $q->where('user_id', $user->id))
            ->latest()->take(5)->get()->map(function ($r) {
                return [
                    'id' => $r->id,
                    'type' => 'Vehicle',
                    'url' => 'vehicle',
                    'employeeName' => $r->user->name ?? '',
                    'employeeCode' => 'EMP00'.($r->user->id ?? ''),
                    'CreateDate' => Carbon::parse($r->created_at)->format('Y-m-d H:i:s'),

                    'status' => $r->status,
                ];
            });

        $recommendationRequests = RecommendationRequest::with('user')
            ->when(! $isAdmin, fn ($q) => $q->where('user_id', $user->id))
            ->latest()->take(5)->get()->map(function ($r) {
                return [
                    'id' => $r->id,
                    'type' => 'Recommendation',
                    'url' => 'recommendation',
                    'employeeName' => $r->user->name ?? '',
                    'employeeCode' => 'EMP00'.($r->user->id ?? ''),
                    'CreateDate' => Carbon::parse($r->created_at)->format('Y-m-d H:i:s'),
                    'status' => $r->status,
                ];
            });

        $equipmentRequests = EquipmentRequest::with('user')
            ->when(! $isAdmin, fn ($q) => $q->where('user_id', $user->id))
            ->latest()->take(5)->get()->map(function ($r) {
                return [
                    'id' => $r->id,
                    'type' => 'Equipment',
                    'url' => 'equipment',
                    'employeeName' => $r->user->name ?? '',
                    'employeeCode' => 'EMP00'.($r->user->id ?? ''),
                    'CreateDate' => Carbon::parse($r->created_at)->format('Y-m-d H:i:s'), // چون equipment start_at نداره
                    'status' => $r->status,
                ];
            });

        $recentRequests = collect()
            ->merge($leaveRequests)
            ->merge($vehicleRequests)
            ->merge($recommendationRequests)
            ->merge($equipmentRequests)
            ->sortByDesc(fn (array $r) => strtotime($r['CreateDate'] ?? '0'))
            ->take(10)
            ->values();

        $managedUsers = [];

        if ($user->is_manager) {
            $managedUsers = \App\Models\User::where('manager_id', $user->id)
                ->select('id', 'name', 'email')
                ->get()
                ->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'code' => 'EMP00'.$u->id,
                    ];
                });
        }

        return Inertia::render('dashboard', [
            'stats' => compact('leave', 'vehicle', 'recommendation', 'equipment'),
            'recentRequests' => $recentRequests,
            'managedUsers' => $managedUsers,

        ]);
    }
}
