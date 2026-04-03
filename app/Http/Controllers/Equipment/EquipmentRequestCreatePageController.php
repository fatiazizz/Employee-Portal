<?php

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use App\Models\ProductTemplate;
use App\Models\WarehouseItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EquipmentRequestCreatePageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $templateIdsWithStock = WarehouseItem::whereNull('recipient_id')
            ->select('product_template_id')
            ->groupBy('product_template_id')
            ->havingRaw('SUM(quantity) > 0')
            ->pluck('product_template_id');
        $templates = ProductTemplate::whereIn('id', $templateIdsWithStock)->orderBy('name')->get();
        $availableProducts = $templates->map(function (ProductTemplate $p) {
            $available = (int) WarehouseItem::where('product_template_id', $p->id)->whereNull('recipient_id')->sum('quantity');

            return [
                'id' => $p->id,
                'name' => $p->name,
                'category' => $p->category,
                'type' => $p->type,
                'available_quantity' => $available,
            ];
        })->values()->all();

        return Inertia::render('equipment/create', [
            'employee_name' => $user->name,
            'employee_code' => 'EMP00'.$user->id,
            'now' => now()->format('Y-m-d\TH:i'),
            'availableProducts' => $availableProducts,
        ]);
    }
}
