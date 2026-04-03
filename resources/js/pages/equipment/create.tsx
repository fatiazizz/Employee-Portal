import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Product Request', href: '/equipment-request' },
    { title: 'Create', href: '/equipment-request/create' },
];

type AvailableProduct = {
    id: number;
    name: string;
    category: string;
    type: string;
    available_quantity: number;
};

export default function CreateEquipment() {
    const { employee_name, employee_code, now, availableProducts } = usePage<{
        employee_name: string;
        employee_code: string;
        now: string;
        availableProducts: AvailableProduct[];
    }>().props;

    const [productSearch, setProductSearch] = useState('');
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [requestedAmount, setRequestedAmount] = useState(1);
    const [items, setItems] = useState<{ product_template_id: number; product_name: string; quantity: number }[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const searchLower = productSearch.trim().toLowerCase();
    const filteredProducts = searchLower
        ? availableProducts.filter(
              (p) =>
                  p.name.toLowerCase().includes(searchLower) ||
                  (p.category && p.category.toLowerCase().includes(searchLower)) ||
                  (p.type && p.type.toLowerCase().includes(searchLower)),
          )
        : [];

    const selectedProduct = selectedProductId
        ? availableProducts.find((p) => String(p.id) === selectedProductId) ?? null
        : null;

    const addItem = () => {
        if (!selectedProduct) {
            setValidationError('Select a product from inventory first.');
            return;
        }
        const alreadyRequested = items
            .filter((i) => i.product_template_id === selectedProduct.id)
            .reduce((s, i) => s + i.quantity, 0);
        const maxQty = selectedProduct.available_quantity - alreadyRequested;
        if (requestedAmount < 1 || requestedAmount > maxQty) {
            setValidationError('Requested amount exceeds available quantity for this product.');
            return;
        }
        setValidationError(null);
        const existing = items.find((i) => i.product_template_id === selectedProduct.id);
        if (existing) {
            setItems(
                items.map((i) =>
                    i.product_template_id === selectedProduct.id
                        ? { ...i, quantity: i.quantity + requestedAmount }
                        : i,
                ),
            );
        } else {
            setItems([
                ...items,
                {
                    product_template_id: selectedProduct.id,
                    product_name: selectedProduct.name,
                    quantity: requestedAmount,
                },
            ]);
        }
        setSelectedProductId('');
        setProductSearch('');
        setRequestedAmount(1);
    };

    const selectProduct = (p: AvailableProduct) => {
        setSelectedProductId(String(p.id));
        setProductSearch(p.name);
    };

    const removeItem = (productTemplateId: number) => {
        setItems(items.filter((i) => i.product_template_id !== productTemplateId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            setValidationError('Add at least one product with requested amount.');
            return;
        }
        setValidationError(null);
        setProcessing(true);
        try {
            await api.post('/equipment-request/create', { items });
            router.visit('/equipment-request');
        } catch (error: any) {
            setValidationError(error?.response?.data?.message || 'Failed to submit request.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Product Request" />
            <div className="mx-auto mt-6 w-full max-w-2xl rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-xl font-bold text-gray-800">New Product Request</h1>
                <p className="mb-4 text-sm text-gray-600">
                    Select products from inventory, set the requested amount, and submit. Your department manager will review the request.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-sm text-gray-500">
                        Current Date & Time: <strong>{now}</strong>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Employee Name</label>
                        <input value={employee_name} disabled className="w-full rounded border bg-gray-100 px-3 py-2" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Employee Code</label>
                        <input value={employee_code} disabled className="w-full rounded border bg-gray-100 px-3 py-2" />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">Add products from inventory</label>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <label className="mb-1 block text-xs text-gray-500">Product (type to filter inventory)</label>
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => {
                                        setProductSearch(e.target.value);
                                        if (!e.target.value) setSelectedProductId('');
                                    }}
                                    onFocus={() => setProductSearch((s) => s || '')}
                                    placeholder="Type product name, category, or type..."
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
                                />
                                {productSearch.trim() && filteredProducts.length > 0 && (
                                    <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded border border-gray-200 bg-white shadow-lg">
                                        {filteredProducts.map((p) => (
                                            <li
                                                key={p.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => selectProduct(p)}
                                                onKeyDown={(e) => e.key === 'Enter' && selectProduct(p)}
                                                className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${
                                                    selectedProductId === String(p.id) ? 'bg-blue-50' : ''
                                                }`}
                                            >
                                                {p.name} ({p.type})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {productSearch.trim() && filteredProducts.length === 0 && (
                                    <p className="absolute z-10 mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow">
                                        No matching products in inventory.
                                    </p>
                                )}
                            </div>
                            <div className="w-28">
                                <label className="mb-1 block text-xs text-gray-500">Requested amount</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={requestedAmount}
                                    onChange={(e) => setRequestedAmount(parseInt(e.target.value, 10) || 1)}
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                    placeholder="Qty"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                disabled={!selectedProduct}
                                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Add
                            </button>
                        </div>
                        {availableProducts.length === 0 && (
                            <p className="mt-2 text-sm text-amber-600">No products available in inventory.</p>
                        )}
                    </div>

                    {items.length > 0 && (
                        <div>
                            <label className="mb-1 block text-sm font-medium">Requested items</label>
                            <ul className="rounded border border-gray-200">
                                {items.map((item) => (
                                    <li
                                        key={item.product_template_id}
                                        className="flex items-center justify-between border-b border-gray-100 px-3 py-2 last:border-b-0"
                                    >
                                        <span>
                                            {item.product_name} × {item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.product_template_id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {validationError && <div className="text-sm text-red-600">{validationError}</div>}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => router.visit('/equipment-request')}
                            className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || items.length === 0}
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
