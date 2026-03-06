<?php 

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\EquipmentRequest;

class EquipmentRequestPageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = EquipmentRequest::query()
            ->with(['user']);

                            // فقط اگر ادمین نباشد، فیلتر خاص اعمال شود
    if (!$user->is_admin) {
        $query->where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhere('approver_id', $user->id);
        });
    }


        $equipmentRequests = $query->latest()->get()->map(function ($equipment) {
            return [
                'id'            => $equipment->id,
                'employeeName'  => $equipment->user->name,
                'employeeCode'  => "EMP00" . $equipment->user->id,
                'items'         => $equipment->items, // آرایه‌ای از تجهیزات
                'createdAt'     => $equipment->created_at->format('Y-m-d H:i:s'),
                'status'        => $equipment->status,
            ];
        });

        return Inertia::render('equipment/index', [
            'equipmentRequests' => $equipmentRequests,
        ]);
    }
}
