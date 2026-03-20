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
    const [selectedProduct, setSelectedProduct] = useState<AvailableProduct | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [items, setItems] = useState<{ product_template_id: number; product_name: string; quantity: number }[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const filteredProducts = productSearch.trim()
        ? availableProducts.filter(
              (p) => p.name.toLowerCase().indexOf(productSearch.toLowerCase()) >= 0,
          ).slice(0, 20)
        : [];

    const addItem = () => {
        if (!selectedProduct) {
            setValidationError('Select a product first.');
            return;
        }
        const available = selectedProduct.available_quantity;
        const alreadyRequested = items
            .filter((i) => i.product_template_id === selectedProduct.id)
            .reduce((s, i) => s + i.quantity, 0);
        const maxQty = available - alreadyRequested;
        if (quantity < 1 || quantity > maxQty) {
            setValidationError(`Quantity must be between 1 and ${maxQty} for this product.`);
            return;
        }
        setValidationError(null);
        const existing = items.find((i) => i.product_template_id === selectedProduct.id);
        if (existing) {
            setItems(
                items.map((i) =>
                    i.product_template_id === selectedProduct.id
                        ? { ...i, quantity: i.quantity + quantity }
                        : i,
                ),
            );
        } else {
            setItems([...items, { product_template_id: selectedProduct.id, product_name: selectedProduct.name, quantity }]);
        }
        setSelectedProduct(null);
        setQuantity(1);
        setProductSearch('');
    };

    const removeItem = (productTemplateId: number) => {
        setItems(items.filter((i) => i.product_template_id !== productTemplateId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            setValidationError('Add at least one product with quantity.');
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
                        <label className="mb-2 block text-sm font-medium">Add products (type product name, select, then set quantity)</label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder="Type product name..."
                                    className="w-full rounded border px-3 py-2"
                                />
                                {filteredProducts.length > 0 && productSearch.trim() && (
                                    <ul className="mt-1 max-h-48 overflow-auto rounded border bg-white shadow">
                                        {filteredProducts.map((p) => (
                                            <li
                                                key={p.id}
                                                className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                                onClick={() => {
                                                    setSelectedProduct(p);
                                                    setProductSearch(p.name);
                                                }}
                                            >
                                                {p.name} — {p.available_quantity} in stock
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {selectedProduct && (
                                <>
                                    <input
                                        type="number"
                                        min={1}
                                        max={selectedProduct.available_quantity}
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                                        className="w-24 rounded border px-2 py-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {items.length > 0 && (
                        <div>
                            <label className="mb-1 block text-sm font-medium">Requested items</label>
                            <ul className="rounded border">
                                {items.map((item) => (
                                    <li key={item.product_template_id} className="flex items-center justify-between border-b px-3 py-2 last:border-b-0">
                                        <span>{item.product_name} × {item.quantity}</span>
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
