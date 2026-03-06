import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leave Requests', href: '/leave-request' },
];

const statusStyles:any = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

export default function LeaveList() {
    const { leaveRequests } = usePage<any>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Requests" />

            <div className="px-6 py-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Leave Requests</h1>
                    <Link
                        href="/leave-request/create"
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        + New Leave Request
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-lg bg-white shadow">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-gray-100 text-center text-xs text-gray-600 uppercase">
                            <tr>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Start Date</th>
                                <th className="px-4 py-3">End Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveRequests.map((req: any) => (
                                <tr key={req.id} className="border-b text-center hover:bg-gray-50">
                                    <td className="px-4 py-3">{req.employeeName}</td>
                                    <td className="px-4 py-3">{req.employeeCode}</td>
                                    <td className="px-4 py-3">{req.startDate}</td>
                                    <td className="px-4 py-3">{req.endDate}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusStyles[req.status]}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/leave-request/${req.id}`} className="text-xs text-blue-600 hover:underline">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {leaveRequests.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-4 text-center text-gray-400">
                                        No leave requests found.
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
