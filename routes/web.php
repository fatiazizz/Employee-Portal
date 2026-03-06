<?php

use App\Http\Controllers\Admin\UsersListPageController;
use App\Http\Controllers\Manager\ManagerUsersListPageController;
use App\Http\Controllers\Manager\ManagerUsersShowPageController;
use App\Http\Controllers\Admin\DepartemanListPageController;
use App\Http\Controllers\Admin\UsersShowPageController;
use App\Http\Controllers\Admin\WarehouseListPageController;
use App\Http\Controllers\Admin\VehicleListPageController;
use App\Http\Controllers\Admin\DriverListPageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Leave\LeaveRequestCreateController;
use App\Http\Controllers\Leave\LeaveRequestCreatePageController;
use App\Http\Controllers\Leave\LeaveRequestPageController;
use App\Http\Controllers\Leave\LeaveRequestShowPageController;
use App\Http\Controllers\Leave\LeaveStatusController;

use App\Http\Controllers\Recommendation\RecommendationRequestCreateController;
use App\Http\Controllers\Recommendation\RecommendationRequestCreatePageController;
use App\Http\Controllers\Recommendation\RecommendationRequestPageController;
use App\Http\Controllers\Recommendation\RecommendationRequestShowPageController;
use App\Http\Controllers\Recommendation\RecommendationStatusController;


use App\Http\Controllers\Equipment\EquipmentRequestCreateController;
use App\Http\Controllers\Equipment\EquipmentRequestCreatePageController;
use App\Http\Controllers\Equipment\EquipmentRequestPageController;
use App\Http\Controllers\Equipment\EquipmentRequestShowPageController;
use App\Http\Controllers\Equipment\EquipmentStatusController;

use App\Http\Controllers\Vehicle\VehicleRequestCreateController;
use App\Http\Controllers\Vehicle\VehicleRequestCreatePageController;
use App\Http\Controllers\Vehicle\VehicleRequestPageController;
use App\Http\Controllers\Vehicle\VehicleRequestShowPageController;
use App\Http\Controllers\Vehicle\VehicleStatusController;



use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {


    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('admin')->group(function () {
        Route::prefix('users')->group(function () {
            /*
            |--------------------------------------------------------------------------
            | Pages (Inertia)
            |--------------------------------------------------------------------------
            */
            Route::get('/', [UsersListPageController::class, 'index'])->name('admin.users.list');
            Route::get('/{id}', [UsersShowPageController::class, 'show'])->name('admin.users.show');
            Route::post('{id}/manager', [UsersShowPageController::class, 'updateManager'])->name('admin.users.updateManager');
            Route::post('/{id}/make-admin', [UsersShowPageController::class, 'makeAdmin']);
            Route::post('{id}/leave-balance', [UsersShowPageController::class, 'setLeaveBalance']);
            Route::post('{id}/set-manager', [UsersShowPageController::class, 'setManagerStatus']);
            Route::post('{id}/change-status', [UsersShowPageController::class, 'setChangeStatus']);
            Route::post('{id}/change-status-end-job', [UsersShowPageController::class, 'setChangeStatusEndJob']);
            Route::post('{id}/update-job-info', [UsersShowPageController::class, 'setUpdateJobInfo']);
        });
        Route::prefix('departments')->group(function () {
            /*
            |--------------------------------------------------------------------------
            | Pages (Inertia)
            |--------------------------------------------------------------------------
            */
            Route::get('/', [DepartemanListPageController::class, 'index'])->name('admin.department.list');
            Route::post('create', [DepartemanListPageController::class, 'create'])->name('admin.department.create');

            Route::post('{id}/set-manager', [DepartemanListPageController::class, 'setManager']);

        });
        Route::prefix('driver')->group(function () {
            /*
            |--------------------------------------------------------------------------
            | Pages (Inertia)
            |--------------------------------------------------------------------------
            */
            Route::get('/', [DriverListPageController::class, 'index'])->name('admin.department.list');
            Route::post('create', [DriverListPageController::class, 'create'])->name('admin.department.create');
            Route::post('/{id}/toggle-status', [DriverListPageController::class, 'toggleStatus']);

        });
        Route::prefix('vehicles')->group(function () {
            /*
            |--------------------------------------------------------------------------
            | Pages (Inertia)
            |--------------------------------------------------------------------------
            */
            Route::get('/', [VehicleListPageController::class, 'index'])->name('admin.vehicles.list');
            Route::post('create', [VehicleListPageController::class, 'create'])->name('admin.vehicles.create');
            Route::put('/{id}/toggle-status', [VehicleListPageController::class, 'toggleStatus']);

        });
        Route::prefix('warehouse')->group(function () {
            /*
            |--------------------------------------------------------------------------
            | Pages (Inertia)
            |--------------------------------------------------------------------------
            */
            Route::get('/', [WarehouseListPageController::class, 'index'])->name('admin.department.list');
            Route::post('create', [WarehouseListPageController::class, 'create'])->name('admin.department.create');
            Route::post('/{id}/update-quantity', [WarehouseListPageController::class, 'updateQuantity']);

        });
    });

    Route::prefix('manager')->group(function () {
        Route::prefix('users')->group(function () {
            /*
            |--------------------------------------------------------------------------
            | Pages (Inertia)
            |--------------------------------------------------------------------------
            */
            Route::get('/', [ManagerUsersListPageController::class, 'index'])->name('manager.users.list');
            Route::get('/{id}', [ManagerUsersShowPageController::class, 'show'])->name('manager.users.show');
        });
    });


    Route::prefix('leave-request')->group(function () {
        /*
        |--------------------------------------------------------------------------
        | Pages (Inertia)
        |--------------------------------------------------------------------------
        */
        Route::get('/', [LeaveRequestPageController::class, 'index'])->name('leave-request');
        Route::get('/create', [LeaveRequestCreatePageController::class, 'index'])->name('leave-request-create');
        Route::get('/{id}', [LeaveRequestShowPageController::class, 'index'])->name('leave-request-show');

        /*
        |--------------------------------------------------------------------------
        | Actions (Form submissions, status changes)
        |--------------------------------------------------------------------------
        */
        Route::post('/create', [LeaveRequestCreateController::class, 'store'])->name('leave-request.create');
        Route::post('/{id}/status', [LeaveStatusController::class, 'update'])->name('leave-request.status');
    });

    Route::prefix('recommendation-request')->group(function () {
        /*
        |--------------------------------------------------------------------------
        | Pages (Inertia)
        |--------------------------------------------------------------------------
        */
        Route::get('/', [RecommendationRequestPageController::class, 'index'])->name('recommendation-request');
        Route::get('/create', [RecommendationRequestCreatePageController::class, 'index'])->name('recommendation-request-create');
        Route::get('/{id}', [RecommendationRequestShowPageController::class, 'index'])->name('recommendation-request-show');

        /*
        |--------------------------------------------------------------------------
        | Actions (Form submissions, status changes)
        |--------------------------------------------------------------------------
        */
        Route::post('/create', [RecommendationRequestCreateController::class, 'store'])->name('recommendation-request.create');
        Route::post('/{id}/status', [RecommendationStatusController::class, 'update'])->name('recommendation-request.status');
    });

    Route::prefix('equipment-request')->group(function () {
        /*
        |--------------------------------------------------------------------------
        | Pages (Inertia)
        |--------------------------------------------------------------------------
        */
        Route::get('/', [EquipmentRequestPageController::class, 'index'])->name('equipment-request');
        Route::get('/create', [EquipmentRequestCreatePageController::class, 'index'])->name('equipment-request-create');
        Route::get('/{id}', [EquipmentRequestShowPageController::class, 'index'])->name('equipment-request-show');

        /*
        |--------------------------------------------------------------------------
        | Actions (Form submissions, status changes)
        |--------------------------------------------------------------------------
        */
        Route::post('/create', [EquipmentRequestCreateController::class, 'store'])->name('equipment-request.create');
        Route::post('/{id}/status', [EquipmentStatusController::class, 'update'])->name('equipment-request.status');
    });


    Route::prefix('vehicle-request')->group(function () {
        /*
        |--------------------------------------------------------------------------
        | Pages (Inertia)
        |--------------------------------------------------------------------------
        */
        Route::get('/', [VehicleRequestPageController::class, 'index'])->name('vehicle-request');
        Route::get('/create', [VehicleRequestCreatePageController::class, 'index'])->name('vehicle-request-create');
        Route::get('/{id}', [VehicleRequestShowPageController::class, 'index'])->name('vehicle-request-show');

        /*
        |--------------------------------------------------------------------------
        | Actions (Form submissions, status changes)
        |--------------------------------------------------------------------------
        */
        Route::post('/create', [VehicleRequestCreateController::class, 'store'])->name('vehicle-request.create');
        Route::post('/{id}/status', [VehicleStatusController::class, 'update'])->name('vehicle-request.status');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
