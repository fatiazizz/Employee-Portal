import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehicle Request', href: '/vehicle-request' },
    { title: 'Create', href: '/vehicle-request/create' },
];

export default function CreateVehicle() {
    const { employee_name, employee_code, now, allUsers } = usePage<any>().props;
  
    const { data, setData, post, processing, errors, reset } = useForm({
        vehicle_id: '',
        driver_id: '',
        startDateTime: now,
        endDateTime: now,
        origin: '',
        destination: '',
        companions: [], // array of selected user ids
    });

    const [validationError, setValidationError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setValidationError(null);

        try {
            await api.post('/vehicle-request/create', {
                vehicle_id: data.vehicle_id,
                driver_id: data.driver_id || null,
                start_at: data.startDateTime,
                end_at: data.endDateTime,
                origin: data.origin,
                destination: data.destination,
                companions: data.companions,
            });
            router.visit('/vehicle-request');
        } catch (error: any) {
            setValidationError(error.response?.data?.message || 'Unexpected error');
            console.error('Submit error:', error);
        }
    };

    const handleDecline = () => {
        reset();
        router.visit('/vehicle-request');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Vehicle Request" />
            <div className="mx-auto mt-6 w-full max-w-3xl rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-xl font-bold text-gray-800">New Vehicle Request</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="text-sm text-gray-500">
                        Current Date & Time: <strong>{dayjs().format('YYYY-MM-DD HH:mm')}</strong>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Employee Name</label>
                        <input value={employee_name} disabled className="w-full rounded border bg-gray-100 px-3 py-2" />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Employee Code</label>
                        <input value={employee_code} disabled className="w-full rounded border bg-gray-100 px-3 py-2" />
                    </div>

                    {/* مبدا */}
                    <div>
  <label className="mb-1 block text-sm font-medium">Origin</label>
                        <input
                            type="text"
                            value={data.origin}
                            onChange={(e) => setData('origin', e.target.value)}
                            className="w-full rounded border px-3 py-2"
                            required
                        />
                    </div>

                    {/* مقصد */}
                    <div>
  <label className="mb-1 block text-sm font-medium">Destination</label>
                        <input
                            type="text"
                            value={data.destination}
                            onChange={(e) => setData('destination', e.target.value)}
                            className="w-full rounded border px-3 py-2"
                            required
                        />
                    </div>

                    {/* همراهان (حداکثر ۳ نفر) */}
                    <div>
  <label className="mb-1 block text-sm font-medium">Companions (up to 3 people)</label>
                        <div className="max-h-40 space-y-2 overflow-auto rounded border p-2">
                            {allUsers.map((user: any) => (
                                <div key={user.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        value={user.id}
                                        checked={data.companions.includes(user.id)}
                                        onChange={(e) => {
                                            const id = parseInt(e.target.value);
                                            const checked = e.target.checked;
                                            if (checked && data.companions.length < 3) {
                                                setData('companions', [...data.companions, id]);
                                            } else if (!checked) {
                                                setData(
                                                    'companions',
                                                    data.companions.filter((uid) => uid !== id),
                                                );
                                            }
                                        }}
                                    />
                                    <span className="text-sm">{user.name}</span>
                                </div>
                            ))}
                        </div>
    <div className="mt-1 text-sm text-red-600">You can select up to 3 companions only.</div>
                    </div>

                    {/* <div>
                        <label className="mb-1 block text-sm font-medium">Select Vehicle</label>
                        <select
                            required
                            value={data.vehicle_id}
                            onChange={(e) => setData('vehicle_id', e.target.value)}
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="">-- Select --</option>
                            {vehicles.map((v: any) => (
                                <option key={v.id} value={v.id}>
                                    {v.name}
                                </option>
                            ))}
                        </select>
                        {errors.vehicle_id && <div className="mt-1 text-sm text-red-600">{errors.vehicle_id}</div>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Select Driver</label>
                        <select
                            value={data.driver_id}
                            onChange={(e) => setData('driver_id', e.target.value)}
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="">-- Optional --</option>
                            {drivers.map((d: any) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                        {errors.driver_id && <div className="mt-1 text-sm text-red-600">{errors.driver_id}</div>}
                    </div> */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Start Date & Time</label>
                            <input
                                type="datetime-local"
                                value={data.startDateTime}
                                onChange={(e) => setData('startDateTime', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                            {errors.start_at && <div className="mt-1 text-sm text-red-600">{errors.start_at}</div>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">End Date & Time</label>
                            <input
                                type="datetime-local"
                                value={data.endDateTime}
                                onChange={(e) => setData('endDateTime', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                            {errors.end_at && <div className="mt-1 text-sm text-red-600">{errors.end_at}</div>}
                        </div>
                    </div>

                    {validationError && <div className="text-sm text-red-600">{validationError}</div>}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleDecline}
                            className="rounded bg-gray-200 px-4 py-2 text-gray-800 transition hover:bg-gray-300"
                        >
                            Decline
                        </button>
                        <button type="submit" disabled={processing} className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
