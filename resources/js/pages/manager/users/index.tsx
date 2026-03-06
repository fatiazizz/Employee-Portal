import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Users', href: '/manager/users' },
];

export default function ManagerUsersIndex() {

const { users } = usePage<any>().props;
console.log("users",users);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users Overview" />

      <div className="mt-6 rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-xl font-bold text-gray-800">Department User List Overview</h1>

        <div className="overflow-auto">
          <table className="w-full table-auto border-collapse text-sm text-left text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Code</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Leave</th>
                <th className="px-4 py-2 border">Vehicle</th>
                <th className="px-4 py-2 border">Recommendation</th>
                <th className="px-4 py-2 border">Equipment</th>
                <th className="px-4 py-2 border">Actions</th>

              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{index + 1}</td>
                  <td className="px-4 py-2 border">{user.name}</td>
                  <td className="px-4 py-2 border">{user.code}</td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">
                    <div className="flex flex-col gap-1">
                      <span>Count: {user.leave_count}</span>
                      <span className="text-xs text-gray-500">Last: {user.last_leave ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex flex-col gap-1">
                      <span>Count: {user.vehicle_count}</span>
                      <span className="text-xs text-gray-500">Last: {user.last_vehicle ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex flex-col gap-1">
                      <span>Count: {user.recommendation_count}</span>
                      <span className="text-xs text-gray-500">Last: {user.last_recommendation ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex flex-col gap-1">
                      <span>Count: {user.equipment_count}</span>
                      <span className="text-xs text-gray-500">Last: {user.last_equipment ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 border text-center">
  <Link
    href={`/manager/users/${user.id}`}
    className="text-blue-600 hover:underline text-sm"
  >
    View
  </Link>
</td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-3 text-center text-gray-500">
                    No users found.
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
