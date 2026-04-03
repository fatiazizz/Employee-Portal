<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\ProductTemplate;
use App\Models\WarehouseItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseListPageController extends Controller
{
    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        try {
            $items = WarehouseItem::with(['productTemplate', 'country', 'recipient', 'department'])
                ->orderBy('id')
                ->get()
                ->map(fn (WarehouseItem $item) => [
                    'id' => $item->id,
                    'product_name' => $item->productTemplate?->name ?? '',
                    'category' => $item->productTemplate?->category ?? '',
                    'type' => $item->productTemplate?->type ?? '',
                    'serial_number' => $item->serial_number,
                    'country' => $item->country?->name,
                    'production_date' => $item->production_date?->format('Y-m-d'),
                    'purchase_date' => $item->purchase_date?->format('Y-m-d') ?? '',
                    'registered_at' => $item->registered_at?->format('Y-m-d') ?? '',
                    'quantity' => $item->quantity,
                    'recipient' => $item->recipient ? $item->recipient->name : null,
                    'department' => $item->department ? $item->department->name : null,
                    'delivery_date' => $item->delivery_date?->format('Y-m-d'),
                ]);

            $productTemplates = ProductTemplate::orderBy('name')->get(['id', 'name', 'category', 'type']);
            $countries = Country::orderBy('name')->get(['id', 'name']);
            $loadError = null;
        } catch (\Throwable $e) {
            \Log::error('Warehouse index failed: '.$e->getMessage(), ['exception' => $e]);
            $items = [];
            $productTemplates = [];
            $countries = [];
            $loadError = 'Warehouse data could not be loaded. Please run migrations/seeders and try again.';
        }

        return Inertia::render('admin/warehouse/index', [
            'warehouseItems' => $items,
            'productTemplates' => $productTemplates,
            'countries' => $countries,
            'loadError' => $loadError,
        ]);
    }

    public function searchProductTemplates(Request $request)
    {
        $this->authorizeAdmin($request);
        $q = $request->input('q', '');
        $list = ProductTemplate::when($q !== '', fn ($query) => $query->where('name', 'like', '%'.$q.'%'))
            ->orderBy('name')
            ->limit(50)
            ->get(['id', 'name', 'category', 'type']);

        return response()->json($list);
    }

    public function searchCountries(Request $request)
    {
        $q = $request->input('q', '');
        $list = Country::when($q !== '', fn ($query) => $query->where('name', 'like', '%'.$q.'%'))
            ->orderBy('name')
            ->limit(50)
            ->get(['id', 'name']);

        return response()->json($list);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $request->merge([
            'serial_number' => $request->input('serial_number') ?: null,
            'country_id' => $request->input('country_id') ?: null,
            'production_date' => $request->input('production_date') ?: null,
        ]);

        $template = ProductTemplate::findOrFail($request->input('product_template_id'));
        $isCapital = $template->type === 'capital';

        $rules = [
            'product_template_id' => ['required', 'exists:product_templates,id'],
            'serial_number' => ['nullable', 'string', 'size:10', 'regex:/^[A-Za-z][0-9]{9}$/', 'unique:warehouse_items,serial_number'],
            'country_id' => ['nullable', 'exists:countries,id'],
            'production_date' => ['nullable', 'date'],
            'purchase_date' => ['required', 'date'],
            'registered_at' => ['required', 'date'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
        if ($isCapital) {
            $rules['serial_number'] = ['required', 'string', 'size:10', 'regex:/^[A-Za-z][0-9]{9}$/', 'unique:warehouse_items,serial_number'];
            $rules['country_id'] = ['required', 'exists:countries,id'];
            $rules['production_date'] = ['required', 'date'];
            $rules['quantity'] = ['sometimes', 'integer', 'min:1'];
        }

        $messages = [
            'serial_number.unique' => 'The serial number is already in use. Serial numbers must be unique.',
        ];
        $validated = $request->validate($rules, $messages);

        if ($isCapital) {
            $validated['quantity'] = 1;
        }

        $validated['production_date'] = $validated['production_date'] ?? null;
        $validated['country_id'] = $validated['country_id'] ?? null;
        $validated['serial_number'] = $validated['serial_number'] ?? null;

        $purchase = \Carbon\Carbon::parse($validated['purchase_date']);
        if (! empty($validated['production_date']) && \Carbon\Carbon::parse($validated['production_date'])->gte($purchase)) {
            return response()->json(['message' => 'Date of production must be before date of purchase.'], 422);
        }
        $registered = \Carbon\Carbon::parse($validated['registered_at']);
        if ($registered->lt($purchase)) {
            return response()->json(['message' => 'Date of registration must be on or after date of purchase.'], 422);
        }

        try {
            $nextId = WarehouseItem::nextIdForType($template->type);
            $validated['id'] = $nextId;
            WarehouseItem::create($validated);
        } catch (\Throwable $e) {
            \Log::error('Warehouse store failed: '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'message' => 'Could not register product: '.$e->getMessage(),
            ], 422);
        }

        return response()->json(['message' => 'Product registered successfully.']);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $request->merge([
            'serial_number' => $request->input('serial_number') ?: null,
            'country_id' => $request->input('country_id') ?: null,
            'production_date' => $request->input('production_date') ?: null,
        ]);

        $item = WarehouseItem::with('productTemplate')->findOrFail($id);
        if ($item->recipient_id !== null) {
            return response()->json(['message' => 'Cannot edit a product that has been delivered.'], 422);
        }

        $template = $item->productTemplate;
        $isCapital = $template->type === 'capital';

        $rules = [
            'serial_number' => ['nullable', 'string', 'size:10', 'regex:/^[A-Za-z][0-9]{9}$/', 'unique:warehouse_items,serial_number,'.$id],
            'country_id' => ['nullable', 'exists:countries,id'],
            'production_date' => ['nullable', 'date'],
            'purchase_date' => ['required', 'date'],
            'registered_at' => ['required', 'date'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
        if ($isCapital) {
            $rules['serial_number'] = ['required', 'string', 'size:10', 'regex:/^[A-Za-z][0-9]{9}$/', 'unique:warehouse_items,serial_number,'.$id];
            $rules['country_id'] = ['required', 'exists:countries,id'];
            $rules['production_date'] = ['required', 'date'];
            $rules['quantity'] = ['sometimes', 'integer', 'min:1'];
        }

        $messages = [
            'serial_number.unique' => 'The serial number is already in use. Serial numbers must be unique.',
        ];
        $validated = $request->validate($rules, $messages);
        if ($isCapital) {
            $validated['quantity'] = 1;
        }

        $purchase = \Carbon\Carbon::parse($validated['purchase_date']);
        if (! empty($validated['production_date']) && \Carbon\Carbon::parse($validated['production_date'])->gte($purchase)) {
            return response()->json(['message' => 'Date of production must be before date of purchase.'], 422);
        }
        $registered = \Carbon\Carbon::parse($validated['registered_at']);
        if ($registered->lt($purchase)) {
            return response()->json(['message' => 'Date of registration must be on or after date of purchase.'], 422);
        }

        $item->update($validated);

        return response()->json(['message' => 'Product updated successfully.']);
    }

    public function destroy(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $item = WarehouseItem::findOrFail($id);
        if ($item->recipient_id !== null) {
            return response()->json(['message' => 'Cannot delete a product that has been delivered.'], 422);
        }
        $item->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    private function authorizeAdmin(Request $request): void
    {
        if (! $request->user() || ! $request->user()->is_admin) {
            abort(403, 'Only admin can manage warehouse.');
        }
    }
}
