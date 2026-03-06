import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehicle Requests', href: '/vehicle-request' },
];

const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700', // fix: status is 'declined' not 'rejected'
};

export default function VehicleList() {
    const { vehicleRequests } = usePage<any>().props;
    console.log("vehicleRequests",vehicleRequests)
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Requests" />

            <div className="px-6 py-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Vehicle Requests</h1>
                    <Link
                        href="/vehicle-request/create"
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        + New Vehicle Request
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-lg bg-white shadow">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-gray-100 text-center text-xs text-gray-600 uppercase">
                            <tr>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Vehicle</th>
                                <th className="px-4 py-3">Driver</th>
                                <th className="px-4 py-3">Start</th>
                                <th className="px-4 py-3">End</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicleRequests.map((req: any) => (
                                <tr key={req.id} className="border-b text-center hover:bg-gray-50">
                                    <td className="px-4 py-3">{req.employeeName}</td>
                                    <td className="px-4 py-3">{req.employeeCode}</td>
                                    <td className="px-4 py-3">{req.vehicleName || '-'}</td>
                                    <td className="px-4 py-3">{req.driverName || '-'}</td>
                                    <td className="px-4 py-3">{req.startDate}</td>
                                    <td className="px-4 py-3">{req.endDate}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusStyles[req.status]}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/vehicle-request/${req.id}`} className="text-xs text-blue-600 hover:underline">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {vehicleRequests.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-4 text-center text-gray-400">
                                        No vehicle requests found.
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
