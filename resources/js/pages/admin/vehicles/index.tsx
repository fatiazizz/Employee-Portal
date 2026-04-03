import Modal from '@/components/ui/modal';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehicles', href: '/admin/vehicles' },
];

type VehicleRow = {
    id: number;
    name: string;
    plate_number: string;
    type: string | null;
    is_active: boolean | number;
    schedule_free: boolean;
    trip_end_at: string | null;
    assignable_after_at: string | null;
};

function isVehicleActive(v: VehicleRow): boolean {
    return Boolean(v.is_active);
}

const SCHEDULE_LOCK_TITLE =
    'Unavailable while busy on an approved trip (includes the 30-minute buffer after trip end).';

function ScheduleDetails({
    schedule_free,
    trip_end_at,
    assignable_after_at,
}: {
    schedule_free: boolean;
    trip_end_at: string | null;
    assignable_after_at: string | null;
}) {
    if (schedule_free) {
        return <span className="text-gray-500">—</span>;
    }
    return (
        <div className="text-xs leading-relaxed">
            <div>
                <span className="font-medium text-gray-600">Trip ends: </span>
                {trip_end_at ?? '—'}
            </div>
            <div className="mt-0.5">
                <span className="font-medium text-gray-600">Assignable after: </span>
                {assignable_after_at ?? '—'}
            </div>
        </div>
    );
}

export default function VehiclesIndex() {
    const { vehicles } = usePage<{ vehicles: VehicleRow[] }>().props;

    const [listFilter, setListFilter] = useState<'all' | 'active' | 'inactive'>('active');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        plate_number: '',
        type: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editVehicle, setEditVehicle] = useState<VehicleRow | null>(null);
    const [editForm, setEditForm] = useState({ name: '', plate_number: '', type: '' });
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const filteredVehicles = useMemo(() => {
        return vehicles.filter((v) => {
            const active = isVehicleActive(v);
            if (listFilter === 'active') {
                return active;
            }
            if (listFilter === 'inactive') {
                return !active;
            }
            return true;
        });
    }, [vehicles, listFilter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            await api.post(`/admin/vehicles/create`, formData);
            setCreateModalOpen(false);
            setFormData({ name: '', plate_number: '', type: '' });
            location.reload();
        } catch (err) {
            alert('An error occurred while creating the vehicle.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEdit = (v: VehicleRow) => {
        setEditVehicle(v);
        setEditForm({
            name: v.name,
            plate_number: v.plate_number,
            type: v.type ?? '',
        });
    };

    const saveEdit = async () => {
        if (!editVehicle || !editForm.name.trim() || !editForm.plate_number.trim() || !editVehicle.schedule_free) {
            return;
        }
        try {
            setIsSavingEdit(true);
            await api.put(`/admin/vehicles/${editVehicle.id}`, {
                name: editForm.name.trim(),
                plate_number: editForm.plate_number.trim(),
                type: editForm.type.trim() || null,
            });
            setEditVehicle(null);
            location.reload();
        } catch (err) {
            alert('An error occurred while saving the vehicle.');
            console.error(err);
        } finally {
            setIsSavingEdit(false);
        }
    };

    const toggleStatus = async (vehicleId: number, currentlyActive: boolean) => {
        try {
            await api.put(`/admin/vehicles/${vehicleId}/toggle-status`, {
                is_active: !currentlyActive,
            });
            location.reload();
        } catch (error) {
            alert('Failed to update status');
            console.error(error);
        }
    };

    const filterTabs: { key: 'all' | 'active' | 'inactive'; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'active', label: 'Active' },
        { key: 'inactive', label: 'Inactive' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicles Overview" />
            <div className="mb-4 mt-5 mr-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setListFilter(tab.key)}
                            className={`rounded px-3 py-1.5 text-sm font-medium ${
                                listFilter === tab.key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                    Create New Vehicle
                </button>
            </div>
            <div className="mt-6 rounded-lg bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">Vehicles List</h1>
                <p className="mb-4 text-sm text-gray-600">
                    New vehicles are inactive until you activate them. Deactivating keeps past vehicle requests intact. Live
                    schedule shows Free or Busy from approved trips (busy from trip start through 30 minutes after trip end).
                </p>

                <div className="overflow-auto">
                    <table className="w-full table-auto border-collapse text-left text-sm text-gray-700">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">#</th>
                                <th className="border px-4 py-2">Name</th>
                                <th className="border px-4 py-2">Plate Number</th>
                                <th className="border px-4 py-2">Type</th>
                                <th className="border px-4 py-2">Fleet</th>
                                <th className="border px-4 py-2">Live schedule</th>
                                <th className="border px-4 py-2">Trip / assignable</th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.map((row, index) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2 text-center">{index + 1}</td>
                                    <td className="border px-4 py-2">{row.name}</td>
                                    <td className="border px-4 py-2">{row.plate_number}</td>
                                    <td className="border px-4 py-2">{row.type}</td>
                                    <td className="border px-4 py-2 text-center">
                                        <span
                                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                isVehicleActive(row)
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-200 text-gray-800'
                                            }`}
                                        >
                                            {isVehicleActive(row) ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="border px-4 py-2 text-center">
                                        <span
                                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                row.schedule_free
                                                    ? 'bg-slate-100 text-slate-800'
                                                    : 'bg-amber-100 text-amber-900'
                                            }`}
                                        >
                                            {row.schedule_free ? 'Free' : 'Busy'}
                                        </span>
                                    </td>
                                    <td className="border px-4 py-2 align-top">
                                        <ScheduleDetails
                                            schedule_free={row.schedule_free}
                                            trip_end_at={row.trip_end_at}
                                            assignable_after_at={row.assignable_after_at}
                                        />
                                    </td>
                                    <td className="border px-4 py-2 text-center">
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(row)}
                                                disabled={!row.schedule_free}
                                                title={!row.schedule_free ? SCHEDULE_LOCK_TITLE : undefined}
                                                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(row.id, isVehicleActive(row))}
                                                disabled={!row.schedule_free}
                                                title={!row.schedule_free ? SCHEDULE_LOCK_TITLE : undefined}
                                                className={`rounded px-3 py-1 text-sm font-semibold text-white ${
                                                    isVehicleActive(row)
                                                        ? 'bg-amber-600 hover:bg-amber-700'
                                                        : 'bg-green-600 hover:bg-green-700'
                                                } disabled:cursor-not-allowed disabled:opacity-50`}
                                            >
                                                {isVehicleActive(row) ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredVehicles.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-3 text-center text-gray-500">
                                        No vehicles in this view.
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
                    <p className="text-sm text-gray-600">The vehicle will be created as inactive until you activate it.</p>

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

                    <div className="flex justify-end gap-2 pt-4">
                        <button className="rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setCreateModalOpen(false)}>
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.name.trim() || !formData.plate_number.trim()}
                            className={`rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 ${
                                isSubmitting ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                        >
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal show={!!editVehicle} onClose={() => setEditVehicle(null)}>
                <div className="space-y-4 p-6">
                    <h2 className="text-lg font-semibold">Edit Vehicle</h2>
                    {editVehicle && !editVehicle.schedule_free && (
                        <p className="text-sm text-amber-800">{SCHEDULE_LOCK_TITLE}</p>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Vehicle Name</label>
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                            disabled={!!editVehicle && !editVehicle.schedule_free}
                            className="w-full rounded border px-3 py-2 disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Plate Number</label>
                        <input
                            type="text"
                            value={editForm.plate_number}
                            onChange={(e) => setEditForm((p) => ({ ...p, plate_number: e.target.value }))}
                            disabled={!!editVehicle && !editVehicle.schedule_free}
                            className="w-full rounded border px-3 py-2 disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                        <input
                            type="text"
                            value={editForm.type}
                            onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
                            disabled={!!editVehicle && !editVehicle.schedule_free}
                            className="w-full rounded border px-3 py-2 disabled:bg-gray-100"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button className="rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setEditVehicle(null)}>
                            Cancel
                        </button>
                        <button
                            disabled={
                                isSavingEdit ||
                                !editForm.name.trim() ||
                                !editForm.plate_number.trim() ||
                                (!!editVehicle && !editVehicle.schedule_free)
                            }
                            onClick={saveEdit}
                            className={`rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 ${
                                isSavingEdit ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                        >
                            {isSavingEdit ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
