import Modal from '@/components/ui/modal';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Driver', href: '/admin/driver' },
];

type DriverRow = {
    id: number;
    name: string;
    license_number: string | null;
    phone: string | null;
    is_active: boolean | number;
    schedule_free: boolean;
    trip_end_at: string | null;
    assignable_after_at: string | null;
};

function isDriverActive(d: DriverRow): boolean {
    return Boolean(d.is_active);
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

export default function DriverIndex() {
    const { drivers } = usePage<{ drivers: DriverRow[] }>().props;

    const [listFilter, setListFilter] = useState<'all' | 'active' | 'inactive'>('active');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newDriverName, setNewDriverName] = useState('');
    const [newLicenseNumber, setNewLicenseNumber] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [changingStatusId, setChangingStatusId] = useState<number | null>(null);
    const [editDriver, setEditDriver] = useState<DriverRow | null>(null);
    const [editName, setEditName] = useState('');
    const [editLicenseNumber, setEditLicenseNumber] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const filteredDrivers = useMemo(() => {
        return drivers.filter((d) => {
            const active = isDriverActive(d);
            if (listFilter === 'active') {
                return active;
            }
            if (listFilter === 'inactive') {
                return !active;
            }
            return true;
        });
    }, [drivers, listFilter]);

    const openEdit = (driver: DriverRow) => {
        setEditDriver(driver);
        setEditName(driver.name);
        setEditLicenseNumber(driver.license_number ?? '');
        setEditPhone(driver.phone ?? '');
    };

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

    const saveEdit = async () => {
        if (!editDriver || !editName.trim() || !editDriver.schedule_free) {
            return;
        }
        try {
            setIsSavingEdit(true);
            await api.put(`/admin/driver/${editDriver.id}`, {
                name: editName.trim(),
                license_number: editLicenseNumber.trim() || null,
                phone: editPhone.trim() || null,
            });
            setEditDriver(null);
            location.reload();
        } catch (err) {
            alert('An error occurred while saving the driver.');
            console.error(err);
        } finally {
            setIsSavingEdit(false);
        }
    };

    const filterTabs: { key: 'all' | 'active' | 'inactive'; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'active', label: 'Active' },
        { key: 'inactive', label: 'Inactive' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Driver Overview" />
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
                    Create New Driver
                </button>
            </div>

            <div className="mt-6 rounded-lg bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">Driver List</h1>
                <p className="mb-4 text-sm text-gray-600">
                    New drivers are inactive until you activate them. Deactivating keeps past vehicle requests intact. Live
                    schedule shows Free or Busy from approved trips (busy from trip start through 30 minutes after trip end).
                </p>

                <div className="overflow-auto">
                    <table className="w-full table-auto border-collapse text-left text-sm text-gray-700">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">#</th>
                                <th className="border px-4 py-2">Name</th>
                                <th className="border px-4 py-2">License Number</th>
                                <th className="border px-4 py-2">Phone</th>
                                <th className="border px-4 py-2">Fleet</th>
                                <th className="border px-4 py-2">Live schedule</th>
                                <th className="border px-4 py-2">Trip / assignable</th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDrivers.map((driver, index) => (
                                <tr key={driver.id} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2 text-center">{index + 1}</td>
                                    <td className="border px-4 py-2">{driver.name}</td>
                                    <td className="border px-4 py-2">{driver.license_number}</td>
                                    <td className="border px-4 py-2">{driver.phone}</td>
                                    <td className="border px-4 py-2 text-center">
                                        <span
                                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                isDriverActive(driver)
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-200 text-gray-800'
                                            }`}
                                        >
                                            {isDriverActive(driver) ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="border px-4 py-2 text-center">
                                        <span
                                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                driver.schedule_free
                                                    ? 'bg-slate-100 text-slate-800'
                                                    : 'bg-amber-100 text-amber-900'
                                            }`}
                                        >
                                            {driver.schedule_free ? 'Free' : 'Busy'}
                                        </span>
                                    </td>
                                    <td className="border px-4 py-2 align-top">
                                        <ScheduleDetails
                                            schedule_free={driver.schedule_free}
                                            trip_end_at={driver.trip_end_at}
                                            assignable_after_at={driver.assignable_after_at}
                                        />
                                    </td>
                                    <td className="border px-4 py-2 text-center">
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(driver)}
                                                disabled={!driver.schedule_free}
                                                title={!driver.schedule_free ? SCHEDULE_LOCK_TITLE : undefined}
                                                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(driver.id)}
                                                disabled={changingStatusId === driver.id || !driver.schedule_free}
                                                title={!driver.schedule_free ? SCHEDULE_LOCK_TITLE : undefined}
                                                className={`rounded px-3 py-1 text-sm text-white ${
                                                    isDriverActive(driver)
                                                        ? 'bg-amber-600 hover:bg-amber-700'
                                                        : 'bg-green-600 hover:bg-green-700'
                                                } disabled:cursor-not-allowed disabled:opacity-50 ${changingStatusId === driver.id ? 'cursor-wait opacity-50' : ''}`}
                                            >
                                                {isDriverActive(driver) ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredDrivers.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-3 text-center text-gray-500">
                                        No drivers in this view.
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
                    <p className="mb-4 text-sm text-gray-600">The driver will be created as inactive until you activate them.</p>

                    <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={newDriverName}
                        onChange={(e) => setNewDriverName(e.target.value)}
                        placeholder="Driver name"
                        className="mb-4 w-full rounded border px-3 py-2"
                    />

                    <label className="mb-2 block text-sm font-medium text-gray-700">License Number</label>
                    <input
                        type="text"
                        value={newLicenseNumber}
                        onChange={(e) => setNewLicenseNumber(e.target.value)}
                        placeholder="e.g. 123456789"
                        className="mb-4 w-full rounded border px-3 py-2"
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

            <Modal show={!!editDriver} onClose={() => setEditDriver(null)}>
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">Edit Driver</h2>
                    {editDriver && !editDriver.schedule_free && (
                        <p className="mb-4 text-sm text-amber-800">{SCHEDULE_LOCK_TITLE}</p>
                    )}

                    <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={!!editDriver && !editDriver.schedule_free}
                        className="mb-4 w-full rounded border px-3 py-2 disabled:bg-gray-100"
                    />

                    <label className="mb-2 block text-sm font-medium text-gray-700">License Number</label>
                    <input
                        type="text"
                        value={editLicenseNumber}
                        onChange={(e) => setEditLicenseNumber(e.target.value)}
                        disabled={!!editDriver && !editDriver.schedule_free}
                        className="mb-4 w-full rounded border px-3 py-2 disabled:bg-gray-100"
                    />

                    <label className="mb-2 block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        disabled={!!editDriver && !editDriver.schedule_free}
                        className="w-full rounded border px-3 py-2 disabled:bg-gray-100"
                    />

                    <div className="mt-4 flex justify-end gap-2">
                        <button className="rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setEditDriver(null)}>
                            Cancel
                        </button>
                        <button
                            disabled={isSavingEdit || !editName.trim() || (!!editDriver && !editDriver.schedule_free)}
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
