<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductTemplate;
use App\Models\WarehouseItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseInventoryPageController extends Controller
{
    public function index(Request $request)
    {
        if (! $request->user() || ! $request->user()->is_admin) {
            abort(403, 'Only admin can view warehouse inventory.');
        }

        $types = $request->input('types', []);
        $categories = $request->input('categories', []);
        if (! is_array($types)) {
            $types = array_filter([$types]);
        }
        if (! is_array($categories)) {
            $categories = array_filter([$categories]);
        }

        $query = WarehouseItem::with('productTemplate')
            ->whereNull('recipient_id');

        if (! empty($types)) {
            $query->whereHas('productTemplate', fn ($q) => $q->whereIn('type', $types));
        }
        if (! empty($categories)) {
            $query->whereHas('productTemplate', fn ($q) => $q->whereIn('category', $categories));
        }

        $aggregated = $query->get()
            ->groupBy('product_template_id')
            ->map(function ($items) {
                $first = $items->first();
                $template = $first->productTemplate;
                $total = $items->sum('quantity');

                return [
                    'product_name' => $template->name,
                    'type' => $template->type,
                    'category' => $template->category,
                    'quantity' => $total,
                ];
            })
            ->values()
            ->sortBy('product_name')
            ->values()
            ->all();

        $allCategories = ProductTemplate::distinct()->pluck('category')->sort()->values()->all();
        $allTypes = ['consumable', 'capital'];

        return Inertia::render('admin/warehouse/inventory', [
            'items' => $aggregated,
            'allCategories' => $allCategories,
            'allTypes' => $allTypes,
            'filterTypes' => $types,
            'filterCategories' => $categories,
        ]);
    }
}
