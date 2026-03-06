<?php 

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class EquipmentRequestCreatePageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('equipment/create', [
            'employee_name'     => $user->name,
            'employee_code'     => "EMP00".$user->id,
            'now'               => now()->format('Y-m-d\TH:i'), // datetime-local format
        ]);
    }
}
