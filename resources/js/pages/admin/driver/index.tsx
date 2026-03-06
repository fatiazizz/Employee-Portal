import Modal from '@/components/ui/modal';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Driver', href: '/admin/driver' },
];

export default function DriverIndex() {
    const { drivers } = usePage<any>().props;

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newDriverName, setNewDriverName] = useState('');
    const [newLicenseNumber, setNewLicenseNumber] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [changingStatusId, setChangingStatusId] = useState<number | null>(null);

    const toggleStatus = async (id: number) => {
        try {
            setChangingStatusId(id);
            await api.post(`/admin/driver/${id}/toggle-status`);
            location.reload();
        } catch (err) {
            alert('An error occurred while updating status.');
            console.error(err);
        } finally {
            setChangingStatusId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Driver Overview" />
            <div className="mb-4 text-right mt-5  mr-4">
                <button onClick={() => setCreateModalOpen(true)} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                    Create New Driver
                </button>
            </div>

            <div className="mt-6 rounded-lg bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">Driver List Overview</h1>

                <div className="overflow-auto">
                    <table className="w-full table-auto border-collapse text-left text-sm text-gray-700">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">#</th>
                                <th className="border px-4 py-2">Name</th>
                                <th className="border px-4 py-2">License Number</th>
                                <th className="border px-4 py-2">Phone</th>
                                <th className="border px-4 py-2">Status</th>
                                <th className="border px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((driver, index) => (
                                <tr key={driver.id} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2 text-center">{index + 1}</td>
                                     <td className="border px-4 py-2">{driver.name}</td>
                                    <td className="border px-4 py-2">{driver.license_number}</td>
                                    <td className="border px-4 py-2">{driver.phone}</td>
                                    <td className="border px-4 py-2 text-center">
                                        <span
                                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                driver.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {driver.is_active ? 'Free' : 'Busy'}
                                        </span>
                                    </td>
                                    <td className="border px-4 py-2 text-center">
                                        <button
                                            onClick={() => toggleStatus(driver.id)}
                                            disabled={changingStatusId === driver.id}
                                            className={`rounded px-3 py-1 text-sm text-white ${
                                                driver.is_active
                                                    ? 'bg-red-600 hover:bg-red-700'
                                                    : 'bg-green-600 hover:bg-green-700'
                                            } ${changingStatusId === driver.id ? 'opacity-50 cursor-wait' : ''}`}
                                        >
                                              {driver.is_active === 0 ? 'Free' : 'Busy'}
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {drivers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                                        No drivers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)}>
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">Create New Driver</h2>

                    <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={newDriverName}
                        onChange={(e) => setNewDriverName(e.target.value)}
                        placeholder="Driver name"
                        className="w-full rounded border px-3 py-2 mb-4"
                    />

                    <label className="mb-2 block text-sm font-medium text-gray-700">License Number</label>
                    <input
                        type="text"
                        value={newLicenseNumber}
                        onChange={(e) => setNewLicenseNumber(e.target.value)}
                        placeholder="e.g. 123456789"
                        className="w-full rounded border px-3 py-2 mb-4"
                    />

                    <label className="mb-2 block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="e.g. 09123456789"
                        className="w-full rounded border px-3 py-2"
                    />

                    <div className="mt-4 flex justify-end gap-2">
                        <button className="rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setCreateModalOpen(false)}>
                            Cancel
                        </button>
                        <button
                            disabled={isSubmitting || !newDriverName.trim()}
                            onClick={async () => {
                                try {
                                    setIsSubmitting(true);
                                    await api.post(`/admin/driver/create`, {
                                        name: newDriverName,
                                        license_number: newLicenseNumber,
                                        phone: newPhone,
                                    });
                                    setCreateModalOpen(false);
                                    setNewDriverName('');
                                    setNewLicenseNumber('');
                                    setNewPhone('');
                                    location.reload();
                                } catch (err) {
                                    alert('An error occurred while creating the driver.');
                                    console.error(err);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className={`rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 ${
                                isSubmitting ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                        >
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
