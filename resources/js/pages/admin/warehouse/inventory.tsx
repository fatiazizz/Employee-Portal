import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Warehouse Inventory', href: '/admin/warehouse-inventory' },
];

type InventoryRow = {
    product_name: string;
    type: string;
    category: string;
    quantity: number;
};

export default function WarehouseInventoryPage() {
    const { items, allCategories, allTypes, filterTypes, filterCategories } = usePage<{
        items: InventoryRow[];
        allCategories: string[];
        allTypes: string[];
        filterTypes?: string[];
        filterCategories?: string[];
    }>().props;
    const [selectedTypes, setSelectedTypes] = useState<string[]>(filterTypes ?? []);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(filterCategories ?? []);

    const toggleType = (t: string) => {
        setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
    };
    const toggleCategory = (c: string) => {
        setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
    };

    const applyFilter = () => {
        const params = new URLSearchParams();
        selectedTypes.forEach((t) => params.append('types[]', t));
        selectedCategories.forEach((c) => params.append('categories[]', c));
        router.get('/admin/warehouse-inventory', Object.fromEntries(params));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Warehouse Inventory" />
            <div className="px-6 py-4">
                <h1 className="mb-4 text-xl font-bold text-gray-800">Warehouse Inventory</h1>

                <div className="mb-4 rounded-lg bg-white p-4 shadow">
                    <h2 className="mb-2 text-sm font-medium text-gray-700">Filter by type (multiple)</h2>
                    <div className="mb-2 flex flex-wrap gap-2">
                        {allTypes.map((t) => (
                            <label key={t} className="flex items-center gap-1 text-sm">
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.includes(t)}
                                    onChange={() => toggleType(t)}
                                />
                                {t}
                            </label>
                        ))}
                    </div>
                    <h2 className="mb-2 text-sm font-medium text-gray-700">Filter by category (multiple)</h2>
                    <div className="mb-2 flex max-h-32 flex-wrap gap-2 overflow-auto">
                        {allCategories.map((c) => (
                            <label key={c} className="flex items-center gap-1 text-sm">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(c)}
                                    onChange={() => toggleCategory(c)}
                                />
                                {c}
                            </label>
                        ))}
                    </div>
                    <button
                        onClick={applyFilter}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                        Apply filter
                    </button>
                </div>

                <div className="rounded-lg bg-white shadow">
                    <ul className="divide-y">
                        {items.map((row, idx) => (
                            <li key={idx} className="px-4 py-3 text-gray-700">
                                {row.product_name}, {row.type}, {row.quantity} piece{row.quantity !== 1 ? 's' : ''}
                            </li>
                        ))}
                    </ul>
                </div>
                {items.length === 0 && (
                    <p className="mt-4 text-center text-gray-500">No items in inventory match the filter.</p>
                )}
            </div>
        </AppLayout>
    );
}
