import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/admin/users' },
];

export default function UserShowPage() {
    const { user, allUsers, auth, departeman } = usePage<any>().props;

    return (
        <AppLayout breadcrumbs={[...breadcrumbs, { title: user.name }]}>
            <Head title={`User: ${user.name}`} />

            <div className="mx-auto mt-6 w-full rounded-lg bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">User Details</h1>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* نمایش دستی مدیر */}

                    {/* نمایش بقیه فیلدها */}
                    {Object.entries(user).map(([key, value]) => {
                        // از نمایش فیلدهایی که نمی‌خواهیم تکراری بشن صرف‌نظر می‌کنیم
                        if (key === 'manager' || key === 'status' || key === 'department') return null;

                        return (
                            <div key={key}>
                                <strong className="block text-gray-500">{key}</strong>
                                <span className="text-gray-800">{String(value ?? '—')}</span>
                            </div>
                        );
                    })}

                    <div>
                        <strong className="block text-gray-500">Status</strong>
                        <span className="text-gray-800">{user.status == 0 ? 'Deactive' : 'Active'}</span>
                    </div>
                    <div>
                        <strong className="block text-gray-500">Department</strong>
                        <span className="text-gray-800">{user.department?.department?.name ?? '—'}</span>
                    </div>
                    <div>
                        <strong className="block text-gray-500">Manager</strong>
                        <span className="text-gray-800">{user.manager?.name ?? '—'}</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
