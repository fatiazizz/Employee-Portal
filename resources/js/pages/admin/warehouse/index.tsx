import Modal from '@/components/ui/modal';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Warehouse', href: '/admin/warehouse' },
];

export default function WarehouseIndex() {
    const { warehouses } = usePage<any>().props;
    const [editableQuantities, setEditableQuantities] = useState<Record<number, string>>(
        Object.fromEntries(warehouses.map((w: any) => [w.id, w.quantity.toString()])),
    );
    const [savingId, setSavingId] = useState<number | null>(null);

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newQuantityName, setNewQuantityName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Overview" />
            <div className="mt-5 mb-4 text-right  mr-4">
                <button onClick={() => setCreateModalOpen(true)} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                    Create New Product
                </button>
            </div>
            <div className="mt-6 rounded-lg bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">Warehouse List Overview</h1>
                {successMessage && <div className="mb-4 rounded bg-green-100 px-4 py-2 text-sm text-green-800 shadow">{successMessage}</div>}

                <div className="overflow-auto">
                    <table className="w-full table-auto border-collapse text-left text-sm text-gray-700">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">#</th>
                                <th className="border px-4 py-2">Name</th>
                                <th className="border px-4 py-2">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.map((warehouse, index) => (
                                <tr key={warehouse.id} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2 text-center">{index + 1}</td>
                                    <td className="border px-4 py-2">{warehouse.type}</td>

                                    <td className="border px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="w-24 rounded border px-2 py-1 text-sm"
                                                value={editableQuantities[warehouse.id] || ''}
                                                onChange={(e) =>
                                                    setEditableQuantities({
                                                        ...editableQuantities,
                                                        [warehouse.id]: e.target.value,
                                                    })
                                                }
                                            />
                                            <button
                                                onClick={async () => {
                                                    setSavingId(warehouse.id);
                                                    try {
                                                        await api.post(`/admin/warehouse/${warehouse.id}/update-quantity`, {
                                                            quantity: editableQuantities[warehouse.id],
                                                        });
                                                        setSuccessMessage(`Quantity updated for "${warehouse.type}"`);
                                                        setTimeout(() => setSuccessMessage(null), 5000);
                                                    } catch (err) {
                                                        alert('Error updating quantity');
                                                        console.error(err);
                                                    } finally {
                                                        setSavingId(null);
                                                    }
                                                }}
                                                className={`rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 ${
                                                    savingId === warehouse.id ? 'cursor-wait opacity-50' : ''
                                                }`}
                                                disabled={savingId === warehouse.id}
                                            >
                                                {savingId === warehouse.id ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)}>
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">Create New Warehouse</h2>

                    <label className="mb-2 block text-sm font-medium text-gray-700">Product Name</label>
                    <input
                        type="text"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="e.g. Finance"
                        className="w-full rounded border px-3 py-2"
                    />

                    <label className="mb-2 block text-sm font-medium text-gray-700">Warehouse Quantity</label>
                    <input
                        type="text"
                        value={newQuantityName}
                        onChange={(e) => setNewQuantityName(e.target.value)}
                        placeholder="e.g. Finance"
                        className="w-full rounded border px-3 py-2"
                    />

                    <div className="mt-4 flex justify-end gap-2">
                        <button className="rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setCreateModalOpen(false)}>
                            Cancel
                        </button>
                        <button
                            disabled={isSubmitting || newProductName.trim() === ''}
                            onClick={async () => {
                                try {
                                    setIsSubmitting(true);
                                    await api.post(`/admin/warehouse/create`, {
                                        type: newProductName,
                                        quantity: newQuantityName,
                                    });
                                    setCreateModalOpen(false);
                                    setNewProductName('');
                                    setNewQuantityName('');
                                    location.reload(); // برای تازه‌سازی لیست
                                } catch (err) {
                                    alert('An error occurred while creating the warehouse.');
                                    console.error(err);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
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
