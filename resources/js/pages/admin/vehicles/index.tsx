import Modal from '@/components/ui/modal';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehicles', href: '/admin/vehicles' },
];

export default function VehiclesIndex() {
    const { vehicless } = usePage<any>().props;

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        plate_number: '',
        type: '',
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'is_active' ? value === 'true' : value,
        }));
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            await api.post(`/admin/vehicless/create`, formData);
            setCreateModalOpen(false);
            setFormData({ name: '', plate_number: '', type: '', is_active: true });
            location.reload();
        } catch (err) {
            alert('An error occurred while creating the vehicle.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (vehicleId: number, currentStatus: number) => {

        try {
            await api.put(`/admin/vehicles/${vehicleId}/toggle-status`, {
                is_active: currentStatus == 0 ? 1 : 0,
            });
            location.reload(); // یا بهتر: فقط لیست را به‌روزرسانی کن بدون reload
        } catch (error) {
            alert('Failed to update status');
            console.error(error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicles Overview" />
            <div className="mt-5 mb-4 text-right mr-4">
                <button onClick={() => setCreateModalOpen(true)} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                    Create New Vehicle
                </button>
            </div>
            <div className="mt-6 rounded-lg bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">Vehicles List Overview</h1>

                <div className="overflow-auto">
                    <table className="w-full table-auto border-collapse text-left text-sm text-gray-700">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">#</th>
                                <th className="border px-4 py-2">Name</th>
                                <th className="border px-4 py-2">Plate Number</th>
                                <th className="border px-4 py-2">Type</th>
                                <th className="border px-4 py-2">Status</th>
                                <th className="border px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicless.map((vehicles, index) => (
                                <tr key={vehicles.id} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2 text-center">{index + 1}</td>
                                    <td className="border px-4 py-2">{vehicles.name}</td>
                                    <td className="border px-4 py-2">{vehicles.plate_number}</td>
                                    <td className="border px-4 py-2">{vehicles.type}</td>
                                    <td className="border px-4 py-2 text-center">
                                        {vehicles.is_active ? (
                                            <span className="font-semibold bg-green-100 text-green-800 px-2 py-1">Free</span>
                                        ) : (
                                            <span className="font-semibold bg-red-100 text-red-800 px-2 py-1">Busy</span>
                                        )}
                                    </td>
                                    <td className="border px-4 py-2 text-center">
                                        <button
                                            onClick={() => toggleStatus(vehicles.id, vehicles.is_active)}
                                            className={`rounded px-3 py-1 font-semibold text-white ${
                                                vehicles.is_active === 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                            }`}
                                        >
                                            {vehicles.is_active === 0 ? 'Free' : 'Busy'}
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {vehicless.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                                        No vehicles found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)}>
                <div className="space-y-4 p-6">
                    <h2 className="text-lg font-semibold">Create New Vehicle</h2>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Vehicle Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Toyota Corolla"
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Plate Number</label>
                        <input
                            type="text"
                            name="plate_number"
                            value={formData.plate_number}
                            onChange={handleChange}
                            placeholder="e.g. 12ب34567"
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                        <input
                            type="text"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            placeholder="e.g. Sedan"
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                        <select
                            name="is_active"
                            value={String(formData.is_active)}
                            onChange={handleChange}
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button className="rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setCreateModalOpen(false)}>
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
