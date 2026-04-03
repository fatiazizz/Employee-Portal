import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Warehouse Report', href: '/admin/warehouse-report' },
];

type Item = {
    id: number;
    product_name: string;
    category: string;
    type: string;
    serial_number: string | null;
    country: string | null;
    production_date: string | null;
    purchase_date: string;
    registered_at: string;
    quantity: number;
    recipient: string | null;
    department: string | null;
    delivery_date: string | null;
};

export default function WarehouseReportPage() {
    const { items, departments, filterDepartments } = usePage<{
        items: Item[];
        departments: { id: number; name: string }[];
        filterDepartments?: number[];
    }>().props;
    const [selectedDepartments, setSelectedDepartments] = useState<number[]>(filterDepartments ?? []);

    const toggleDepartment = (id: number) => {
        setSelectedDepartments((prev) =>
            prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
        );
    };

    const applyFilter = () => {
        const params = new URLSearchParams();
        selectedDepartments.forEach((id) => params.append('departments[]', String(id)));
        router.get('/admin/warehouse-report', Object.fromEntries(params));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Warehouse Report" />
            <div className="px-6 py-4">
                <h1 className="mb-4 text-xl font-bold text-gray-800">Warehouse Report</h1>

                <div className="mb-4 rounded-lg bg-white p-4 shadow">
                    <h2 className="mb-2 text-sm font-medium text-gray-700">Filter by department (multiple)</h2>
                    <div className="flex flex-wrap gap-2">
                        {departments.map((d) => (
                            <label key={d.id} className="flex items-center gap-1 text-sm">
                                <input
                                    type="checkbox"
                                    checked={selectedDepartments.includes(d.id)}
                                    onChange={() => toggleDepartment(d.id)}
                                />
                                {d.name}
                            </label>
                        ))}
                    </div>
                    <button
                        onClick={applyFilter}
                        className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                        Apply filter
                    </button>
                </div>

                <div className="overflow-x-auto rounded-lg bg-white shadow">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">ID</th>
                                <th className="border px-4 py-2">Product</th>
                                <th className="border px-4 py-2">Category</th>
                                <th className="border px-4 py-2">Type</th>
                                <th className="border px-4 py-2">Serial</th>
                                <th className="border px-4 py-2">Country</th>
                                <th className="border px-4 py-2">Production</th>
                                <th className="border px-4 py-2">Purchase</th>
                                <th className="border px-4 py-2">Registered</th>
                                <th className="border px-4 py-2">Qty</th>
                                <th className="border px-4 py-2">Recipient</th>
                                <th className="border px-4 py-2">Department</th>
                                <th className="border px-4 py-2">Delivery date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-t hover:bg-gray-50">
                                    <td className="border px-4 py-2">{item.id}</td>
                                    <td className="border px-4 py-2">{item.product_name}</td>
                                    <td className="border px-4 py-2">{item.category}</td>
                                    <td className="border px-4 py-2 capitalize">{item.type}</td>
                                    <td className="border px-4 py-2">{item.serial_number ?? '—'}</td>
                                    <td className="border px-4 py-2">{item.country ?? '—'}</td>
                                    <td className="border px-4 py-2">{item.production_date ?? '—'}</td>
                                    <td className="border px-4 py-2">{item.purchase_date}</td>
                                    <td className="border px-4 py-2">{item.registered_at}</td>
                                    <td className="border px-4 py-2">{item.quantity}</td>
                                    <td className="border px-4 py-2">{item.recipient ?? '—'}</td>
                                    <td className="border px-4 py-2">{item.department ?? '—'}</td>
                                    <td className="border px-4 py-2">{item.delivery_date ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {items.length === 0 && (
                    <p className="mt-4 text-center text-gray-500">No items match the filter.</p>
                )}
            </div>
        </AppLayout>
    );
}
