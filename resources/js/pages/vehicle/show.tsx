import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehicle Requests', href: '/vehicle-request' },
    { title: 'Details', href: '#' },
];

function statusLabel(status: string): string {
    switch (status) {
        case 'manager_approved':
            return 'Awaiting admin (vehicle & driver)';
        case 'pending':
            return 'Pending manager';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

function statusClass(status: string): string {
    if (status === 'approved') {
        return 'text-green-600';
    }
    if (status === 'rejected') {
        return 'text-red-600';
    }
    if (status === 'manager_approved') {
        return 'text-blue-600';
    }
    return 'text-yellow-600';
}

export default function VehicleShow() {
    const { data } = usePage<any>().props;
    const [formData, setFormData] = useState({
        vehicle_id: '',
        driver_id: '',
    });

    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const canAct = data.canManagerAct || data.canAdminAct;

    const parseApiError = (error: any): string => {
        const d = error.response?.data;
        if (d?.message) {
            return d.message;
        }
        if (d?.errors) {
            return Object.values(d.errors)
                .flat()
                .filter(Boolean)
                .join(' ');
        }
        return 'Request failed.';
    };

    const managerSubmit = async (next: 'manager_approved' | 'rejected') => {
        setErrorMessage(null);
        try {
            setProcessing(true);
            await api.post(`/vehicle-request/${data.id}/status`, { status: next });
            setShowModal(false);
            router.reload();
        } catch (error) {
            setErrorMessage(parseApiError(error));
        } finally {
            setProcessing(false);
        }
    };

    const adminSubmit = async (next: 'approved' | 'rejected') => {
        setErrorMessage(null);
        if (next === 'approved' && (!formData.vehicle_id || !formData.driver_id)) {
            setErrorMessage('Select both a vehicle and a driver to approve.');
            return;
        }
        try {
            setProcessing(true);
            const body =
                next === 'rejected'
                    ? { status: 'rejected' }
                    : {
                          status: 'approved',
                          vehicle_id: Number(formData.vehicle_id),
                          driver_id: Number(formData.driver_id),
                      };
            await api.post(`/vehicle-request/${data.id}/status`, body);
            setShowModal(false);
            router.reload();
        } catch (error) {
            setErrorMessage(parseApiError(error));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Vehicle Request #${data.id}`} />

            <div className="mx-auto mt-6 w-full max-w-4xl rounded bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">Vehicle Request Details</h1>

                {errorMessage && (
                    <div className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-800 shadow">{errorMessage}</div>
                )}

                <div className="grid grid-cols-1 gap-6 text-sm text-gray-700 sm:grid-cols-2">
                    <div>
                        <span className="font-medium">Employee Name:</span>
                        <div className="text-gray-900">{data.employeeName ?? '—'}</div>
                    </div>

                    <div>
                        <span className="font-medium">Employee Code:</span>
                        <div className="text-gray-900">{data.employeeCode ?? '—'}</div>
                    </div>

                    <div>
                        <span className="font-medium">Vehicle:</span>
                        <div className="text-gray-900">{data.vehicle?.name ?? '—'}</div>
                    </div>

                    <div>
                        <span className="font-medium">Driver:</span>
                        <div className="text-gray-900">{data.driver?.name ?? '—'}</div>
                    </div>

                    <div>
                        <span className="font-medium">Start At:</span>
                        <div className="text-gray-900">{data.start_at}</div>
                    </div>

                    <div>
                        <span className="font-medium">End At:</span>
                        <div className="text-gray-900">{data.end_at}</div>
                    </div>

                    <div>
                        <span className="font-medium">Created At:</span>
                        <div className="text-gray-900">{data.created_at}</div>
                    </div>

                    <div>
                        <span className="font-medium">Status:</span>
                        <div className={`font-semibold ${statusClass(data.status)}`}>{statusLabel(data.status)}</div>
                    </div>

                    <div className="sm:col-span-2">
                        <span className="font-medium">Direct manager (first approval):</span>
                        <div className="text-gray-900">{data.approver?.name ?? 'Not assigned'}</div>
                    </div>
                </div>
                {canAct && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => {
                                setErrorMessage(null);
                                setShowModal(true);
                            }}
                            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                            {data.canManagerAct ? 'Manager: Approve / Decline' : 'Admin: Assign & finalize'}
                        </button>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-[#00000050]">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
                        {data.canManagerAct && (
                            <>
                                <h2 className="mb-2 text-lg font-semibold text-gray-800">Manager decision</h2>
                                <p className="mb-4 text-sm text-gray-600">
                                    Approve to send this request to an administrator for vehicle and driver assignment, or decline
                                    it. You do not assign resources here.
                                </p>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <button
                                        onClick={() => managerSubmit('manager_approved')}
                                        disabled={processing}
                                        className="flex-1 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Approve (forward to admin)
                                    </button>
                                    <button
                                        onClick={() => managerSubmit('rejected')}
                                        disabled={processing}
                                        className="flex-1 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </>
                        )}

                        {data.canAdminAct && (
                            <>
                                <h2 className="mb-2 text-lg font-semibold text-gray-800">Administrator</h2>
                                <p className="mb-4 text-sm text-gray-600">
                                    Reject without assigning resources, or approve by choosing an available vehicle and driver. Busy
                                    windows are from trip start through 30 minutes after trip end.
                                </p>

                                <div className="mb-4 space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Vehicle</label>
                                        <select
                                            value={formData.vehicle_id}
                                            onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                                            className="w-full rounded border px-3 py-2"
                                        >
                                            <option value="">-- Select vehicle (required to approve) --</option>
                                            {data.allVehicles?.map((v: any) => (
                                                <option key={v.id} value={v.id}>
                                                    {v.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Driver</label>
                                        <select
                                            value={formData.driver_id}
                                            onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                                            className="w-full rounded border px-3 py-2"
                                        >
                                            <option value="">-- Select driver (required to approve) --</option>
                                            {data.allDrivers?.map((d: any) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <button
                                        onClick={() => adminSubmit('approved')}
                                        disabled={processing || !formData.vehicle_id || !formData.driver_id}
                                        className="flex-1 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Approve with assignment
                                    </button>
                                    <button
                                        onClick={() => adminSubmit('rejected')}
                                        disabled={processing}
                                        className="flex-1 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </>
                        )}

                        <div className="mt-4 text-right">
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-sm text-gray-500 hover:underline"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
