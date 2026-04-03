import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin Product Requests', href: '/admin/product-requests' },
];

export default function AdminProductRequestsIndex() {
    const { requests } = usePage<{ requests: any[] }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Requests (Admin)" />
            <div className="px-6 py-4">
                <h1 className="mb-4 text-xl font-bold text-gray-800">Product Requests (Awaiting your approval)</h1>
                <div className="overflow-x-auto rounded-lg bg-white shadow">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-gray-100 text-center text-xs uppercase text-gray-600">
                            <tr>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id} className="border-b text-center hover:bg-gray-50">
                                    <td className="px-4 py-3">{req.employeeName}</td>
                                    <td className="px-4 py-3">{req.employeeCode}</td>
                                    <td className="px-4 py-3">{req.createdAt}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/equipment-request/${req.id}`}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            View & decide
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-gray-400">
                                        No requests awaiting admin approval.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
