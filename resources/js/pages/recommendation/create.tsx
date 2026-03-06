import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Recommendation Request', href: '/recommendation-request' },
    { title: 'Create', href: '/recommendation-request/create' },
];

export default function CreateRecommendation() {
    const { employee_name, employee_code, job_title, start_date, end_date,department,role,auth } = usePage<any>().props;
    console.log("department",department);
    const { data, setData, post, processing, errors, reset } = useForm({
        to: '',
    });

    const [validationError, setValidationError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        try {
            await api.post('/recommendation-request/create', {
                to: data.to,
            });
            router.visit('/recommendation-request');
        } catch (error: any) {
            setValidationError(error.response?.data?.message ?? 'Unexpected error');
        }
    };

    const handleDecline = () => {
        reset();
        router.visit('/recommendation-request');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Recommendation Request" />
            <div className="mx-auto mt-6 w-full  rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-xl font-bold text-gray-800">New Recommendation Request</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Employee Name</label>
                        <input value={employee_name} disabled className="w-full rounded border bg-gray-100 px-3 py-2" />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Employee Code</label>
                        <input value={employee_code} disabled className="w-full rounded border bg-gray-100 px-3 py-2" />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Recipient (To)</label>
                        <input
                            type="text"
                            value={data.to}
                            onChange={(e) => setData('to', e.target.value)}
                            className="w-full rounded border px-3 py-2"
                            placeholder="e.g. University of British Columbia, Academic Services Department"
                            required
                        />
                        {errors.to && <div className="mt-1 text-sm text-red-600">{errors.to}</div>}
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
