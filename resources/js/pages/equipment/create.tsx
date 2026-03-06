import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Equipment Request', href: '/equipment-request' },
    { title: 'Create', href: '/equipment-request/create' },
];

// لیست تجهیزات قابل انتخاب
const equipmentOptions = [
    { label: 'Case', value: 'case' },
    { label: 'Monitor', value: 'monitor' },
    { label: 'Mouse', value: 'mouse' },
    { label: 'Keyboard', value: 'keyboard' },
    { label: 'Printer', value: 'printer' },
    { label: 'Cartridge', value: 'cartridge' },
];

export default function CreateEquipment() {
    const { employee_name, employee_code, now } = usePage<any>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        employeeName: employee_name,
        employeeCode: employee_code,
        requestDate: now,
        items: [] as { type: string; quantity: number }[],
    });

    const [validationError, setValidationError] = useState<string | null>(null);

    const handleCheckboxChange = (item: string) => {
        const updatedItems = data.items.includes(item) ? data.items.filter((i) => i !== item) : [...data.items, item];
        setData('items', updatedItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (data.items.length === 0) {
            setValidationError('Please select at least one equipment item.');
            return;
        }

        setValidationError(null);

        try {
            await api.post('/equipment-request/create', {
                items: data.items,
            });
            router.visit('/equipment-request');
        } catch (error: any) {
            setValidationError(error?.response?.data?.message || 'Failed to submit request.');
            console.error('Submit error:', error);
        }
    };

    const handleDecline = () => {
        reset();
        router.visit('/equipment-request');
    };

    const handleItemChange = (type: string, checked: boolean) => {
        const exists = data.items.find((item) => item.type === type);

        if (checked && !exists) {
            setData('items', [...data.items, { type, quantity: 1 }]);
        } else if (!checked && exists) {
            setData(
                'items',
                data.items.filter((item) => item.type !== type),
            );
        }
    };

    const handleQuantityChange = (type: string, quantity: number) => {
        setData(
            'items',
            data.items.map((item) => (item.type === type ? { ...item, quantity } : item)),
        );
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Equipment Request" />
            <div className="mx-auto mt-6 w-full max-w-2xl rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-xl font-bold text-gray-800">New Equipment Request</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-sm text-gray-500">
                        Current Date & Time: <strong>{data.requestDate}</strong>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Employee Name</label>
                        <input value={data.employeeName} disabled className="w-full rounded border bg-gray-100 px-3 py-2" />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Employee Code</label>
                        <input value={data.employeeCode} disabled className="w-full rounded border bg-gray-100 px-3 py-2" />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">Select Equipment Items</label>
                        <div className="grid grid-cols-1 gap-3">
                            {equipmentOptions.map((option) => {
                                const selected = data.items.find((item) => item.type === option.value);
                                return (
                                    <div key={option.value} className="flex items-center justify-between gap-4">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={!!selected}
                                                onChange={(e) => handleItemChange(option.value, e.target.checked)}
                                                className="h-4 w-4"
                                            />
                                            <span>{option.label}</span>
                                        </label>

                                        {selected && (
                                            <input
                                                type="number"
                                                min={1}
                                                value={selected.quantity}
                                                onChange={(e) => handleQuantityChange(option.value, parseInt(e.target.value, 10) || 1)}
                                                className="w-20 rounded border px-2 py-1 text-sm"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {validationError && <div className="text-sm text-red-600">{validationError}</div>}

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={handleDecline} className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">
                            Decline
                        </button>
                        <button type="submit" disabled={processing} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
