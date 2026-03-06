import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leave Request', href: '/leave-request' },
    { title: 'Create', href: '/leave-request/create' },
];

export default function CreateLeave() {
    const { employee_name, employee_code, remaining_hours, year, now } = usePage<any>().props;
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [calculatedLeave, setCalculatedLeave] = useState(0);
    const { data, setData, post, processing, errors, reset } = useForm({
        employeeName: employee_name,
        employeeCode: employee_code,
        remainingLeave: remaining_hours,
        leaveType: 'hourly', // 'hourly' or 'daily'
        startDateTime: now,
        endDateTime: now,
        totalDays: 0,
    });

        function formatHoursToDays(hours: number): string {
        const days = Math.floor(hours / 8);
        const remainingHours = hours % 8;
        return `${days}  Days and ${remainingHours} Hour`;
    }

    const [validationError, setValidationError] = useState<string | null>(null);

    const calculateDays = () => {
        const start = dayjs(data.startDateTime);
        const end = dayjs(data.endDateTime);

        if (data.leaveType === 'daily') {
            const diff = end.diff(start, 'day') + 1;
            return diff > 0 ? diff : 0;
        } else {
            const diff = end.diff(start, 'hour') / 24;
            return diff > 0 ? diff : 0;
        }
    };

    const calculateLeaveAmount = () => {
        const start = dayjs(data.startDateTime);
        const end = dayjs(data.endDateTime);

        if (!start.isValid() || !end.isValid()) return 0;

        if (data.leaveType === 'daily') {
            const diff = end.diff(start, 'day') + 1; // inclusive
            return diff > 0 ? diff : 0;
        } else {
            const diff = end.diff(start, 'hour', true); // fractional hours
            return diff > 0 ? diff : 0;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const total = calculateLeaveAmount();

        if (total > data.remainingLeave) {
            setValidationError('Requested leave exceeds remaining leave balance.');
            return;
        }
        setCalculatedLeave(total);
        setValidationError(null);
        setShowConfirmModal(true); // نمایش پنجره تأیید قبل از ثبت
    };

    const handleFinalSubmit = async () => {
        try {
            await api.post('/leave-request/create', {
                type: data.leaveType,
                start_at: data.startDateTime,
                end_at: data.endDateTime,
                total_days: calculatedLeave,
            });
            router.visit('/leave-request');
        } catch (error: any) {
            setValidationError(error.response?.data?.message || 'An error occurred.');
        } finally {
            setShowConfirmModal(false);
        }
    };

    const handleDecline = () => {
        reset();
        router.visit('/leave-request');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Leave Request" />
            <div className="mx-auto mt-6 w-full rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-xl font-bold text-gray-800">New Leave Request</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-sm text-gray-500">
                        Current Date & Time: <strong>{dayjs().format('YYYY-MM-DD HH:mm')}</strong>
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
                        <label className="mb-1 block text-sm font-medium">Remaining Leave</label>
                        <input value={data.remainingLeave} disabled className="w-full rounded border bg-gray-100 px-3 py-2" />
                        <div className='mt-2'> Equivalent to: {formatHoursToDays(data.remainingLeave)}</div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Leave Type</label>
                        <select
                            value={data.leaveType}
                            onChange={(e) => setData('leaveType', e.target.value)}
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Start {data.leaveType === 'daily' ? 'Date' : 'Date & Time'}</label>
                            <input
                                type={data.leaveType === 'daily' ? 'date' : 'datetime-local'}
                                value={data.startDateTime}
                                onChange={(e) => setData('startDateTime', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">End {data.leaveType === 'daily' ? 'Date' : 'Date & Time'}</label>
                            <input
                                type={data.leaveType === 'daily' ? 'date' : 'datetime-local'}
                                value={data.endDateTime}
                                onChange={(e) => setData('endDateTime', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>
                    </div>

                    {validationError && <div className="mt-1 text-sm text-red-600">{validationError}</div>}

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
                {showConfirmModal && (
                    <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-[#00000017]">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <h2 className="mb-4 text-lg font-bold text-gray-800">Confirm Leave Request</h2>
                            <p className="mb-2 text-sm text-gray-600">
                                <strong>Leave Type:</strong> {data.leaveType === 'daily' ? 'Daily' : 'Hourly'}
                            </p>
                            <p className="mb-2 text-sm text-gray-600">
                                <strong>Start:</strong> {data.startDateTime}
                            </p>
                            <p className="mb-2 text-sm text-gray-600">
                                <strong>End:</strong> {data.endDateTime}
                            </p>
                            <p className="mb-2 text-sm text-gray-600">
                                <strong>Requested Leave:</strong> {calculatedLeave.toFixed(2)} {data.leaveType === 'daily' ? 'daily' : 'h:mm'}
                            </p>
                            <p className="mb-4 text-sm text-gray-600">
                                <strong>Remaining Leave:</strong> {data.remainingLeave}
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button onClick={handleFinalSubmit} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                    Confirm & Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
