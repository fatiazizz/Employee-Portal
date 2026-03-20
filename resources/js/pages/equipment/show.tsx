import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Product Requests', href: '/equipment-request' },
    { title: 'Details', href: '#' },
];

const statusLabels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved (awaiting admin)',
    rejected: 'Rejected',
    final_approval: 'Final approval',
    final_rejection: 'Final rejection',
};

export default function EquipmentShow() {
    const { data } = usePage<any>().props;
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState(data.status);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [managerApprovedQuantities, setManagerApprovedQuantities] = useState<Record<string, number>>({});
    const [adminDeliveryQuantities, setAdminDeliveryQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        if (data.status === 'pending' && data.items?.length > 0 && data.canManagerAct) {
            const initial: Record<string, number> = {};
            data.items.forEach((item: any) => {
                const tid = String(item.product_template_id);
                initial[tid] = item.quantity ?? 0;
            });
            setManagerApprovedQuantities(initial);
        }
    }, [data.status, data.items, data.canManagerAct]);

    useEffect(() => {
        if (data.status === 'approved' && data.items?.length > 0 && data.canAdminAct) {
            const initial: Record<string, number> = {};
            data.items.forEach((item: any) => {
                const tid = String(item.product_template_id);
                const maxQty = data.manager_approved_items?.[tid] ?? data.inventoryByTemplate?.[item.product_template_id] ?? 0;
                initial[tid] = Math.min(item.quantity ?? 0, maxQty);
            });
            setAdminDeliveryQuantities(initial);
        }
    }, [data.status, data.items, data.canAdminAct, data.manager_approved_items, data.inventoryByTemplate]);

    const handleManagerStatus = async (newStatus: 'approved' | 'rejected') => {
        try {
            setProcessing(true);
            await api.post(`/equipment-request/${data.id}/status`, {
                status: newStatus,
                manager_approved_items: newStatus === 'approved' ? managerApprovedQuantities : undefined,
                comment: undefined,
            });
            setStatus(newStatus);
            setShowModal(false);
            setSuccessMessage(newStatus === 'approved' ? 'Approved. Sent to admin.' : 'Rejected.');
        } catch (error: any) {
            setSuccessMessage(error?.response?.data?.message || 'Error.');
        } finally {
            setProcessing(false);
        }
    };

    const handleAdminStatus = async (newStatus: 'final_approval' | 'final_rejection') => {
        try {
            setProcessing(true);
            await api.post(`/equipment-request/${data.id}/status`, {
                status: newStatus,
                admin_delivery_items: newStatus === 'final_approval' ? adminDeliveryQuantities : undefined,
                comment: undefined,
            });
            setStatus(newStatus);
            setShowModal(false);
            setSuccessMessage(newStatus === 'final_approval' ? 'Finally approved.' : 'Finally rejected.');
        } catch (error: any) {
            setSuccessMessage(error?.response?.data?.message || 'Error.');
        } finally {
            setProcessing(false);
        }
    };

    const items = data.items ?? [];
    const managerApproved = data.manager_approved_items ?? {};
    const adminDelivery = data.admin_delivery_items ?? {};
    const canManagerAct = data.canManagerAct === true;
    const canAdminAct = data.canAdminAct === true;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Product Request #${data.id}`} />

            <div className="mx-auto mt-6 max-w-4xl rounded bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">Product Request Details</h1>

                {successMessage && (
                    <div className="mb-4 rounded bg-green-100 px-4 py-2 text-sm text-green-800 shadow">
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
                        <div className="font-semibold text-gray-900">
                            {statusLabels[status] ?? status}
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <span className="font-medium">Manager (approver):</span>
                        <div className="text-gray-900">{data.approver?.name ?? 'Not assigned'}</div>
                    </div>
                    {data.adminApprover && (
                        <div className="sm:col-span-2">
                            <span className="font-medium">Admin (final):</span>
                            <div className="text-gray-900">{data.adminApprover.name}</div>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <span className="font-medium">Items</span>
                    <table className="mt-2 w-full rounded border text-sm text-gray-700">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 text-left">Product</th>
                                <th className="p-2 text-left">Requested</th>
                                <th className="p-2 text-left">Manager approved</th>
                                <th className="p-2 text-left">In stock</th>
                                {(canAdminAct || adminDelivery && Object.keys(adminDelivery).length > 0) && (
                                    <th className="p-2 text-left">Approved for delivery</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any, idx: number) => {
                                const tid = item.product_template_id;
                                const tidStr = String(tid);
                                const inv = data.inventoryByTemplate?.[tid] ?? 0;
                                const mgrQty = managerApproved[tidStr] ?? item.quantity ?? 0;
                                const admQty = adminDelivery[tidStr] ?? 0;
                                const showAdminCol = canAdminAct || (adminDelivery && admQty > 0);
                                return (
                                    <tr key={idx} className="border-t">
                                        <td className="p-2">{item.product_name}</td>
                                        <td className="p-2">{item.quantity}</td>
                                        <td className="p-2">
                                            {canManagerAct ? (
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={item.quantity}
                                                    value={managerApprovedQuantities[tidStr] ?? mgrQty}
                                                    onChange={(e) =>
                                                        setManagerApprovedQuantities({
                                                            ...managerApprovedQuantities,
                                                            [tidStr]: parseInt(e.target.value, 10) || 0,
                                                        })
                                                    }
                                                    className="w-20 rounded border px-2 py-1"
                                                />
                                            ) : (
                                                mgrQty
                                            )}
                                        </td>
                                        <td className="p-2">{inv}</td>
                                        {showAdminCol && (
                                            <td className="p-2">
                                                {canAdminAct ? (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={inv}
                                                        value={adminDeliveryQuantities[tidStr] ?? admQty}
                                                        onChange={(e) =>
                                                            setAdminDeliveryQuantities({
                                                                ...adminDeliveryQuantities,
                                                                [tidStr]: parseInt(e.target.value, 10) || 0,
                                                            })
                                                        }
                                                        className="w-20 rounded border px-2 py-1"
                                                    />
                                                ) : (
                                                    admQty
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {canManagerAct && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setShowModal(true)}
                            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                            Approve / Reject
                        </button>
                    </div>
                )}
                {canAdminAct && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setShowModal(true)}
                            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                            Final Approve / Reject
                        </button>
                    </div>
                )}
            </div>

            {showModal && canManagerAct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Manager decision</h2>
                        <p className="mb-4 text-sm text-gray-600">Approve (with approved amounts) or reject this request.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleManagerStatus('approved')}
                                disabled={processing}
                                className="flex-1 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleManagerStatus('rejected')}
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

            {showModal && canAdminAct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Admin decision</h2>
                        <p className="mb-4 text-sm text-gray-600">Set approved quantity for delivery (cannot exceed inventory).</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleAdminStatus('final_approval')}
                                disabled={processing}
                                className="flex-1 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                            >
                                Final Approve
                            </button>
                            <button
                                onClick={() => handleAdminStatus('final_rejection')}
                                disabled={processing}
                                className="flex-1 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                            >
                                Final Reject
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
