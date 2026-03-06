import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Recommendation Requests', href: '/recommendation-request' },
];

const statusStyles: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

export default function RecommendationList() {
    const { recommendationRequests } = usePage<any>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Recommendation Requests" />

            <div className="px-6 py-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Recommendation Requests</h1>
                    <Link
                        href="/recommendation-request/create"
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        + New Recommendation Request
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-lg bg-white shadow">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-gray-100 text-center text-xs text-gray-600 uppercase">
                            <tr>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">To</th>
                                <th className="px-4 py-3">Created At</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recommendationRequests.map((req: any) => (
                                <tr key={req.id} className="border-b text-center hover:bg-gray-50">
                                    <td className="px-4 py-3">{req.employeeName}</td>
                                    <td className="px-4 py-3">{req.employeeCode}</td>
                                    <td className="px-4 py-3">{req.to}</td>
                                    <td className="px-4 py-3">{req.createdAt}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusStyles[req.status]}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/recommendation-request/${req.id}`} className="text-xs text-blue-600 hover:underline">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {recommendationRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-gray-400">
                                        No recommendation requests found.
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
