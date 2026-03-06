import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehicle Requests', href: '/vehicle-request' },
    { title: 'Details', href: '#' },
];

export default function VehicleShow() {
    const { data, vehicles, drivers } = usePage<any>().props;
    const [formData, setFormData] = useState({
        vehicle_id: '',
        driver_id: '',
    });

    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState(data.status);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {

        try {
 
            setProcessing(true);
            await api.post(`/vehicle-request/${data.id}/status`, {
                status: newStatus,
                vehicle_id: formData.vehicle_id || null,
                driver_id: formData.driver_id || null,
            });
            setStatus(newStatus);
            setShowModal(false);
            setSuccessMessage(`Status changed to ${newStatus.toUpperCase()} successfully.`);
            setTimeout(() => setSuccessMessage(null), 10000);
        } catch (error) {
            console.error('Status change failed:', error);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Vehicle Request #${data.id}`} />

            <div className="mx-auto mt-6 w-full max-w-4xl rounded bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">Vehicle Request Details</h1>

                {successMessage && (
                    <div
                        className={`mb-4 rounded px-4 py-2 text-sm shadow ${
                            status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {successMessage}
                    </div>
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
                        <div
                            className={`font-semibold ${
                                status === 'approved' ? 'text-green-600' : status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <span className="font-medium">Approver:</span>
                        <div className="text-gray-900">{data.approver?.name ?? 'Not assigned'}</div>
                    </div>
                </div>
                {status === 'pending' && (
                    <div className="mt-6 flex justify-end">
                        <button onClick={() => setShowModal(true)} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                            Change Status
                        </button>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-[#00000050]">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Change Vehicle Request Status</h2>

                        <p className="mb-2 text-sm text-gray-600">Select a vehicle and driver to approve this request:</p>

                        <div className="mb-4 space-y-4">
                            {/* Vehicle select */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">Vehicle</label>
                                <select
                                    value={formData.vehicle_id}
                                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                >
                                    <option value="">-- Select Vehicle --</option>
                                    {data.allVehicles?.map((v: any) => (
                                        <option key={v.id} value={v.id}>
                                            {v.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Driver select */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">Driver</label>
                                <select
                                    value={formData.driver_id}
                                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                >
                                    <option value="">-- Select Driver --</option>
                                    {data.allDrivers?.map((d: any) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStatusChange('approved')}
                                disabled={processing || !formData.vehicle_id || !formData.driver_id}
                                className="flex-1 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleStatusChange('rejected')}
                                disabled={processing}
                                className="flex-1 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                            >
                                Decline
                            </button>
                        </div>

                        <div className="mt-4 text-right">
                            <button onClick={() => setShowModal(false)} className="text-sm text-gray-500 hover:underline">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
