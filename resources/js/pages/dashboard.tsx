// Dashboard.tsx
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard() {
    const { stats, recentRequests , managedUsers } = usePage<any>().props;
    console.log('recentRequests', recentRequests);
    console.log('managedUsers', managedUsers);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

        <div className="p-2">
                     <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent>
                        <h2 className="text-sm text-gray-500">Leave Requests</h2>
                        <p className="text-2xl font-bold text-gray-800">{stats.leave}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <h2 className="text-sm text-gray-500">Vehicle Requests</h2>
                        <p className="text-2xl font-bold text-gray-800">{stats.vehicle}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <h2 className="text-sm text-gray-500">Recommendation Letters</h2>
                        <p className="text-2xl font-bold text-gray-800">{stats.recommendation}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <h2 className="text-sm text-gray-500">Equipment Requests</h2>
                        <p className="text-2xl font-bold text-gray-800">{stats.equipment}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded bg-white p-4 shadow">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Recent Requests</h3>

                <table className="min-w-full overflow-hidden rounded-lg border text-sm text-gray-700">
                    <thead className="bg-gray-100 text-center text-xs text-gray-600 uppercase">
                        <tr>
                            <th className="px-4 py-3">Employee</th>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Create</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentRequests.map((req: any) => (
                            <tr key={req.id} className="border-b text-center hover:bg-gray-50">
                                <td className="px-4 py-3">{req.employeeName}</td>
                                <td className="px-4 py-3">{req.employeeCode}</td>
                                <td className="px-4 py-3">{req.type}</td>
                                <td className="px-4 py-3">{req.CreateDate}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                                            req.status === 'approved'
                                                ? 'bg-green-100 text-green-700'
                                                : req.status === 'rejected'
                                                  ? 'bg-red-100 text-red-700'
                                                  : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                    >
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <a href={`/${req.url}-request/${req.id}`} className="text-xs text-blue-600 hover:underline">
                                        View
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {recentRequests.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-4 text-center text-gray-400">
                                    No requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        {/* {managedUsers?.length > 0 && (
    <div className="mt-10 rounded bg-white p-4 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Users You Manage</h3>

        <table className="min-w-full overflow-hidden rounded-lg border text-sm text-gray-700">
            <thead className="bg-gray-100 text-center text-xs text-gray-600 uppercase">
                <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Code</th>
                </tr>
            </thead>
            <tbody>
                {managedUsers.map((u: any) => (
                    <tr key={u.id} className="border-b text-center hover:bg-gray-50">
                        <td className="px-4 py-3">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.code}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)} */}

        </AppLayout>
    );
}
