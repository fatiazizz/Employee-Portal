import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Recommendation Requests', href: '/recommendation-request' },
    { title: 'Details', href: '#' },
];

export default function RecommendationShow() {
    const { data, user, auth } = usePage<any>().props;
    console.log('auth', auth);
    console.log('data', data);
    const isAdmin = auth?.user?.is_admin === 1;
    const isManager = auth?.user?.id === (data.approver ? data.approver.id : null);

    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState(data.status);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
        try {
            setProcessing(true);
            await api.post(`/recommendation-request/${data.id}/status`, { status: newStatus });
            setStatus(newStatus);
            setShowModal(false);
            setSuccessMessage(`Status changed to ${newStatus.toUpperCase()} successfully.`);
            setTimeout(() => setSuccessMessage(null), 8000);
        } catch (error) {
            console.error('Status change failed:', error);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Recommendation Request #${data.id}`} />

            <div className="mx-auto mt-6 w-full max-w-4xl rounded bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">Recommendation Request Details</h1>

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
                        <span className="font-medium">To:</span>
                        <div className="text-gray-900">{data.to ?? '—'}</div>
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
                {status === 'pending' && (isAdmin || isManager) && (
                    <div className="mt-6 flex justify-end">
                        <button onClick={() => setShowModal(true)} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                            Change Status
                        </button>
                    </div>
                )}
                {status === 'approved' && (isAdmin || isManager) && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => window.print()}
                            className="mx-2 rounded bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-800 print:hidden"
                        >
                            Print Letter
                        </button>
                    </div>
                )}
            </div>
            <div className="mt-4 flex justify-end"></div>
            <div
                className="mt-10 rounded border border-gray-200 bg-gray-50 p-6 text-sm leading-6 whitespace-pre-wrap text-gray-800"
                id="recommendation-print"
            >
                <p>
                    <strong>From:</strong> Atlantic Star Company
                </p>
                <p>
                    <strong>To:</strong> {data.to || '...receiver...'}
                </p>
                <br />
                <p>
                    This letter is to confirm that <strong>{data.employeeName || '...Employee Name...'}</strong> has been employed by <strong> Atlantic Star Company</strong> at 
                     <strong> {data.department.department.name || '...Job Title...'} Department </strong> from   {' '}
                    <strong>{user.start_at || '...Start Date...'}</strong> to <strong>{user.end_at || 'present'}</strong> .
                </p>
                <p>
                    During this period, he/she has been a valued member of our team, performing his/her duties and responsibilities in a professional
                    and dedicated manner.
                </p>
                <p>
                    If you require any further information, please feel free to contact us at <strong>HR@ITcompany.com</strong>.
                </p>
                <br />
                <p>Sincerely,</p>
                {/*<p>
                    <strong>{data.employeeName} </strong>
                </p> */}
                <p>
                    <strong>{data.department.department.name} Manager</strong>
                </p>
                <p>Atlantic Star Company</p>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-[#00000050]">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Change Recommendation Status</h2>
                        <p className="mb-4 text-sm text-gray-600">Select the new status for this recommendation request:</p>

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
