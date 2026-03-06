import Modal from '@/components/ui/modal';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/admin/users' },
];

export default function UserShowPage() {
    const { user, allUsers, auth, departeman , departeman_user } = usePage<any>().props;
    console.log('user', user);
    console.log('departeman_user', departeman_user);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedManagerId, setSelectedManagerId] = useState(user.manager_id);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [manager, setManager] = useState(user.manager_id);
    const [leaveModalOpen, setLeaveModalOpen] = useState(false);
    const [leaveHours, setLeaveHours] = useState(0);
    const [managerModalOpen, setManagerModalOpen] = useState(false);
    const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);
    const [endEmploymentModalOpen, setEndEmploymentModalOpen] = useState(false);
    const [isManagerChecked, setIsManagerChecked] = useState(user.is_manager === 1);
    const [jobModalOpen, setJobModalOpen] = useState(false);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState(user.department_id ?? '');
    const [jobTitle, setJobTitle] = useState(user.job_title ?? '');
    const [additionalLeaveHours, setAdditionalLeaveHours] = useState(0);

    useEffect(() => {
    if (departeman_user) {
        setSelectedDepartmentId(departeman_user.department_id);
        setJobTitle(departeman_user.role);
    }
}, [departeman_user]);


    useEffect(() => {
        if (user.leave_balance) {
            const balanceValue = user.leave_balance.total_hours - user.leave_balance.used_hours;
            setLeaveHours(balanceValue);
        }
    }, [user.leave_balance]);

    function formatHoursToDays(hours: number): string {
        const days = Math.floor(hours / 8);
        const remainingHours = hours % 8;
        return `${days}  Days and ${remainingHours} Hour`;
    }

    const handleSaveManager = async () => {
        try {
            await api.post(`/admin/users/${user.id}/manager`, {
                manager_id: selectedManagerId || null,
            });
            setSuccessMessage(`Manager updated successfully.`);
            setSelectedManagerId(selectedManagerId);
            setManager(selectedManagerId);
            setTimeout(() => setSuccessMessage(null), 10000);
            // alert('Manager updated successfully.');
            setModalOpen(false);
            location.reload();
        } catch (error) {
            console.error('Failed to update manager:', error);
            alert('An error occurred while updating the manager.');
        }
    };

    const handleMakeAdmin = async () => {
        try {
            await api.post(`/admin/users/${user.id}/make-admin`);
            setSuccessMessage(`User granted admin access.`);
            setShowAdminModal(false);
            setTimeout(() => setSuccessMessage(null), 10000);
            location.reload();
        } catch (error) {
            console.error('Failed to make admin:', error);
            alert('An error occurred while updating admin status.');
        }
    };

    const handleSaveLeaveBalance = async () => {
        try {
            await api.post(`/admin/users/${user.id}/leave-balance`, {
                remaining_hours: additionalLeaveHours,
            });
            setSuccessMessage(`Leave balance updated successfully.`);
            setLeaveModalOpen(false);
            setTimeout(() => setSuccessMessage(null), 10000);
            // location.reload();
        } catch (error) {
            console.error('Failed to update leave balance:', error);
            alert('An error occurred while updating leave balance.');
        }
    };

    const handleToggleManager = async () => {
        try {
            await api.post(`/admin/users/${user.id}/set-manager`, {
                is_manager: isManagerChecked ? 1 : 0,
            });
            setSuccessMessage(`Manager status updated.`);
            setManagerModalOpen(false);
            setTimeout(() => setSuccessMessage(null), 10000);
            location.reload();
        } catch (error) {
            console.error('Failed to update manager status:', error);
            alert('An error occurred while updating manager status.');
        }
    };

    const handleChangeStatus = async () => {
        try {
            await api.post(`/admin/users/${user.id}/change-status`);
            setSuccessMessage(`Change status updated.`);
            setManagerModalOpen(false);
            setTimeout(() => setSuccessMessage(null), 10000);
            location.reload();
        } catch (error) {
            console.error('Failed to update change status:', error);
            alert('An error occurred while updating change status.');
        }
    };

    const handleEndEmployment = async () => {
        try {
            await api.post(`/admin/users/${user.id}/end-employment`);
            setSuccessMessage(`Employment ended successfully.`);
            setEndEmploymentModalOpen(false);
            setTimeout(() => setSuccessMessage(null), 10000);
            location.reload();
        } catch (error) {
            console.error('Failed to end employment:', error);
            alert('An error occurred while ending employment.');
        }
    };

    const handleSaveJobInfo = async () => {
        try {
            await api.post(`/admin/users/${user.id}/update-job-info`, {
                department_id: selectedDepartmentId || null,
                job_title: jobTitle,
            });
            setSuccessMessage(`Job info updated successfully.`);
            setJobModalOpen(false);
            setTimeout(() => setSuccessMessage(null), 10000);
            location.reload();
        } catch (error) {
            console.error('Failed to update job info:', error);
            alert('An error occurred while updating job info.');
        }
    };

    return (
        <AppLayout breadcrumbs={[...breadcrumbs, { title: user.name }]}>
            <Head title={`User: ${user.name}`} />

            <div className="mx-auto mt-6 w-full rounded-lg bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">User Details</h1>

                {successMessage && <div className={`mb-4 rounded bg-green-100 px-4 py-2 text-sm text-green-800 shadow`}>{successMessage}</div>}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* نمایش دستی مدیر */}

                    {/* نمایش بقیه فیلدها */}
                    {Object.entries(user).map(([key, value]) => {
                        // از نمایش فیلدهایی که نمی‌خواهیم تکراری بشن صرف‌نظر می‌کنیم
                        if (key === 'manager' || key === 'status' || key === 'department' || key === 'leave_balance') return null;

                        return (
                            <div key={key}>
                                <strong className="block text-gray-500">{key}</strong>
                                <span className="text-gray-800">{String(value ?? '—')}</span>
                            </div>
                        );
                    })}

           <div>
                        <strong className="block text-gray-500">Leave Balance</strong>
                            <span className="text-gray-800">({ user.leave_balance ? formatHoursToDays(user.leave_balance?.total_hours - user.leave_balance?.used_hours) : "-"})</span>
                    </div>

                    <div>
                        <strong className="block text-gray-500">Status</strong>
                        <span className="text-gray-800">{user.status == 0 ? 'Deactive' : 'Active'}</span>
                    </div>
                    <div>
                        <strong className="block text-gray-500">Department</strong>
                        <span className="text-gray-800">{user.department?.department?.name ?? '—'}</span>
                    </div>
                    <div>
                        <strong className="block text-gray-500">Manager</strong>
                        <span className="text-gray-800">{user.manager?.name ?? '—'}</span>
                    </div>
                </div>

                <div className="mt-8">
                    <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={() => setModalOpen(true)}>
                        Change Manager
                    </button>
                    {!user.is_admin && auth.user.is_admin === 1 && (
                        <button
                            className="mx-2 rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                            onClick={() => setShowAdminModal(true)}
                        >
                            Make Admin
                        </button>
                    )}

                    <button
                        className="mx-2 mt-4 rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
                        onClick={() => setLeaveModalOpen(true)}
                    >
                        Set Leave Balance
                    </button>
                    <button
                        className="mx-2 mt-4 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                        onClick={() => setManagerModalOpen(true)}
                    >
                        Set Manager Status
                    </button>

                    <button
                        className="mx-2 mt-4 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                        onClick={() => setChangeStatusModalOpen(true)}
                    >
                        Change Status
                    </button>

                    {user.start_at && (
                        <button
                            className="mx-2 mt-4 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                            onClick={() => setEndEmploymentModalOpen(true)}
                        >
                            End Employment
                        </button>
                    )}

                    <button className="mx-2 mt-4 rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700" onClick={() => setJobModalOpen(true)}>
                        Set Department & Job Title
                    </button>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setModalOpen(false)}>
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">Select New Manager</h2>
                    <select
                        value={selectedManagerId}
                        onChange={(e) => setSelectedManagerId(Number(e.target.value))}
                        className="w-full rounded border px-3 py-2"
                    >
                        <option value="">— No Manager —</option>
                        {allUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                    <div className="mt-4 flex justify-end">
                        <button className="mr-2 rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700" onClick={handleSaveManager}>
                            Save
                        </button>
                    </div>
                </div>
            </Modal>
            {/* Modal: Make Admin Confirmation */}
            <Modal show={showAdminModal} onClose={() => setShowAdminModal(false)}>
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">Make Admin</h2>
                    <p className="mb-4 text-sm text-gray-700">
                        Are you sure you want to grant <strong>{user.name}</strong> admin privileges?
                    </p>
                    <div className="flex justify-end gap-3">
                        <button className="rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setShowAdminModal(false)}>
                            Cancel
                        </button>
                        <button className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={handleMakeAdmin}>
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal show={leaveModalOpen} onClose={() => setLeaveModalOpen(false)}>
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">Add Leave Balance</h2>
                    <p className="mb-4 text-sm text-gray-600">
                        The entered hours will be <strong>added</strong> to the user's current remaining leave balance.
                    </p>
                    <div className="my-3 text-sm text-gray-600">
                        Equivalent to: <strong>{formatHoursToDays(leaveHours)}</strong>
                    </div>

                    <input
                        type="number"
                        min={0}
                        value={additionalLeaveHours}
                        onChange={(e) => setAdditionalLeaveHours(Number(e.target.value))}
                        className="w-full rounded border px-3 py-2"
                    />

                    <p className="my-4 text-sm text-gray-700">
                        After adding: <strong>{formatHoursToDays(leaveHours + additionalLeaveHours)}</strong>
                    </p>

                    <div className="mt-4 flex justify-end gap-2">
                        <button className="rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setLeaveModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700" onClick={handleSaveLeaveBalance}>
                            Save
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal show={managerModalOpen} onClose={() => setManagerModalOpen(false)}>
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">Set Manager Status</h2>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={isManagerChecked} onChange={(e) => setIsManagerChecked(e.target.checked)} />
                        <span>Is Manager</span>
                    </label>
                    <div className="mt-4 flex justify-end gap-2">
                        <button className="rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setManagerModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700" onClick={handleToggleManager}>
                            Save
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal show={changeStatusModalOpen} onClose={() => setChangeStatusModalOpen(false)}>
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">Change Status</h2>
                    <p className="mb-4 text-sm text-gray-700">
                        Are you sure you want to change status to <strong>{user.status == 1 ? 'Deactive' : 'Active'}</strong> ?
                    </p>
                    <div className="flex justify-end gap-3">
                        <button className="rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setChangeStatusModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={handleChangeStatus}>
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal show={endEmploymentModalOpen} onClose={() => setEndEmploymentModalOpen(false)}>
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">End Employment</h2>
                    <p className="mb-4 text-sm text-gray-700">
                        Are you sure you want to end the employment of <strong>{user.name}</strong>?
                    </p>
                    <div className="flex justify-end gap-3">
                        <button className="rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setEndEmploymentModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700" onClick={handleEndEmployment}>
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal show={jobModalOpen} onClose={() => setJobModalOpen(false)}>
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">Set Department & Job Title</h2>

                    <label className="mb-2 block text-sm font-medium text-gray-700">Department</label>
                    <select
                        value={selectedDepartmentId}
                        onChange={(e) => setSelectedDepartmentId(e.target.value)}
                        className="mb-4 w-full rounded border px-3 py-2"
                    >
                        <option value="">— Select Department —</option>
                        {departeman.map((dep: any) => (
                            <option key={dep.id} value={dep.id}>
                                {dep.name}
                            </option>
                        ))}
                    </select>

                    <label className="mb-2 block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full rounded border px-3 py-2"
                        placeholder="e.g. Backend Developer"
                    />

                    <div className="mt-4 flex justify-end gap-2">
                        <button className="rounded px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setJobModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700" onClick={handleSaveJobInfo}>
                            Save
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
