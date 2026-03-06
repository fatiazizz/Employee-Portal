import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Equipment Requests', href: '/equipment-request' },
    { title: 'Details', href: '#' },
];

export default function EquipmentShow() {
    const { data } = usePage<any>().props;
    console.log('data', data);
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState(data.status);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [approvedQuantities, setApprovedQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        if (data.status === 'pending' && data.items?.length > 0) {
            const initialQuantities: Record<string, number> = {};
            data.items.forEach((item: any) => {
                initialQuantities[item.type] = item.quantity;
            });
            setApprovedQuantities(initialQuantities);
        }
    }, [data]);

    const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
        try {
            setProcessing(true);

            let approvedToSend = approvedQuantities;

            // اگر approvedQuantities خالیه، از data.items مقدار بگیر
            if (Object.keys(approvedQuantities).length === 0 && newStatus === 'approved') {
                approvedToSend = {};
                data.items.forEach((item: any) => {
                    approvedToSend[item.type] = item.quantity;
                });
            }

            await api.post(`/equipment-request/${data.id}/status`, {
                status: newStatus,
                approved_items: approvedToSend,
            });

            setStatus(newStatus);
            setShowModal(false);
            setSuccessMessage(`Status changed to ${newStatus.toUpperCase()} successfully.`);
            setTimeout(() => setSuccessMessage(null), 10000);
        } catch (error: any) {
            console.error('Status change failed:', error);
            setSuccessMessage(error?.response?.data?.message || 'Error occurred.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Equipment Request #${data.id}`} />

            <div className="mx-auto mt-6 w-full max-w-4xl rounded bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">Equipment Request Details</h1>

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

                    <div className="sm:col-span-2">
                        <span className="font-medium">Requested Items:</span>
                        <table className="mt-2 w-full rounded border text-sm text-gray-700">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left">Item</th>
                                    <th className="p-2 text-left">Requested</th>
                                    <th className="p-2 text-left">In Stock</th>
                                    <th className="p-2 text-left">Approved</th>
                                    {status === 'pending' && <th className="p-2 text-left">In Stock</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((item: any, idx: number) => {
                                    const stockEntry = data.stock.find((s: any) => s.type === item.type);
                                    const stockQuantity = stockEntry?.quantity ?? 0;
                                    const approvedQty = approvedQuantities[item.type] ?? item.quantity;
                                    const isOverLimit = approvedQty > stockQuantity;

                                    return (
                                        <tr key={idx} className="border-t">
                                            <td className="p-2 capitalize">{item.type}</td>
                                            <td className="p-2">{item.quantity}</td>
                                            <td className="p-2">{stockQuantity}</td>
                                            <td className="p-2">
                                                {status === 'pending' ? (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={stockQuantity}
                                                        disabled={status !== 'pending'}
                                                        value={approvedQty}
                                                        onChange={(e) =>
                                                            setApprovedQuantities({
                                                                ...approvedQuantities,
                                                                [item.type]: parseInt(e.target.value, 10) || 0,
                                                            })
                                                        }
                                                        className={`w-20 rounded border px-2 py-1 text-sm focus:outline-none ${status !== 'pending' ? 'disabled:bg-gray-100 disabled:text-gray-500' : ''} ${isOverLimit ? 'border-red-500 bg-red-50 text-red-700' : 'border-green-500 bg-green-50 text-green-700'}`}
                                                    />
                                                ) : (
                                                    <span>{approvedQty}</span>
                                                )}
                                            </td>

                                            {status === 'pending' && <td className="p-2">{stockQuantity}</td>}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
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

            {/* Modal */}
            {showModal && status === 'pending' && (
                <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-[#00000050]">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Change Equipment Status</h2>
                        <p className="mb-4 text-sm text-gray-600">Select the new status for this equipment request:</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStatusChange('approved')}
                                disabled={processing}
                                className="flex-1 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleStatusChange('rejected')}
                                disabled={processing}
                                className="flex-1 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                            >
                                Reject
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
