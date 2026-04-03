import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CalendarRange, Clock, Info } from 'lucide-react';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leave Request', href: '/leave-request' },
    { title: 'Create', href: '/leave-request/create' },
];

type PageProps = SharedData & {
    employee_name: string;
    employee_code: string;
    remaining_hours: number;
    year: number;
    now: string;
};

function formatHoursToDays(hours: number): string {
    const days = Math.floor(hours / 8);
    const rest = hours % 8;
    return `${days} day${days === 1 ? '' : 's'} and ${rest} hour${rest === 1 ? '' : 's'}`;
}

function computeLeaveAmount(leaveType: 'hourly' | 'daily', startAt: string, endAt: string): number {
    const start = dayjs(startAt);
    const end = dayjs(endAt);
    if (!start.isValid() || !end.isValid()) return 0;
    if (leaveType === 'daily') {
        const diff = end.diff(start, 'day') + 1;
        return diff > 0 ? diff : 0;
    }
    const diff = end.diff(start, 'hour', true);
    return diff > 0 ? diff : 0;
}

export default function CreateLeave() {
    const { employee_name, employee_code, remaining_hours, year, now } = usePage<PageProps>().props;

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [calculatedLeave, setCalculatedLeave] = useState(0);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [finalizing, setFinalizing] = useState(false);

    const { data, setData, processing, reset } = useForm({
        employeeName: employee_name,
        employeeCode: employee_code,
        remainingLeave: remaining_hours,
        leaveType: 'hourly' as 'hourly' | 'daily',
        startDateTime: now,
        endDateTime: now,
        totalDays: 0,
    });

    const estimated = useMemo(
        () => computeLeaveAmount(data.leaveType, data.startDateTime, data.endDateTime),
        [data.leaveType, data.startDateTime, data.endDateTime],
    );

    useEffect(() => {
        setValidationError(null);
        setFieldErrors({});
    }, [data.startDateTime, data.endDateTime, data.leaveType]);

    const exceedsBalance = estimated > data.remainingLeave;

    const estimateLabel =
        data.leaveType === 'daily'
            ? `${estimated.toFixed(estimated % 1 === 0 ? 0 : 1)} day${estimated === 1 ? '' : 's'}`
            : `${estimated.toFixed(1)} hours`;

    const onLeaveTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const v = e.target.value as 'hourly' | 'daily';
        let nextStart = data.startDateTime;
        let nextEnd = data.endDateTime;
        if (v === 'daily') {
            nextStart = nextStart.includes('T') ? nextStart.slice(0, 10) : nextStart;
            nextEnd = nextEnd.includes('T') ? nextEnd.slice(0, 10) : nextEnd;
        } else {
            nextStart = nextStart.includes('T') ? nextStart : `${nextStart}T09:00`;
            nextEnd = nextEnd.includes('T') ? nextEnd : `${nextEnd}T17:00`;
        }
        setData('leaveType', v);
        setData('startDateTime', nextStart);
        setData('endDateTime', nextEnd);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const total = computeLeaveAmount(data.leaveType, data.startDateTime, data.endDateTime);

        if (total > data.remainingLeave) {
            setValidationError('Requested leave exceeds your remaining balance.');
            return;
        }
        if (total <= 0) {
            setValidationError('End must be after start, and the range must be valid.');
            return;
        }

        setCalculatedLeave(total);
        setValidationError(null);
        setShowConfirmModal(true);
    };

    const handleFinalSubmit = async () => {
        setValidationError(null);
        setFieldErrors({});
        setFinalizing(true);
        try {
            await api.post('/leave-request/create', {
                type: data.leaveType,
                start_at: data.startDateTime,
                end_at: data.endDateTime,
                total_days: calculatedLeave,
            });
            router.visit('/leave-request');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; errors?: Record<string, string | string[]> } } };
            const res = err.response?.data;
            if (res?.errors && typeof res.errors === 'object') {
                const next: Record<string, string> = {};
                for (const [key, val] of Object.entries(res.errors)) {
                    next[key] = Array.isArray(val) ? String(val[0]) : String(val);
                }
                setFieldErrors(next);
            }
            setValidationError(res?.message ?? 'Could not submit leave request.');
        } finally {
            setFinalizing(false);
            setShowConfirmModal(false);
        }
    };

    const handleCancel = () => {
        reset();
        router.visit('/leave-request');
    };

    const startLabel = data.leaveType === 'daily' ? 'Start date' : 'Start';
    const endLabel = data.leaveType === 'daily' ? 'End date' : 'End';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Leave Request" />

            <div className="mx-auto mt-4 w-full max-w-5xl px-4 pb-8">
                <Card className="gap-0 border-border/80 py-4 shadow-md sm:py-5">
                    <CardHeader className="space-y-1 px-6 pb-3 pt-0">
                        <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">New leave request</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Choose leave type and dates. Your manager will review and approve or decline.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 pb-2">
                        <form id="leave-request-form" onSubmit={handleSubmit} className="space-y-4">
                            {validationError && !showConfirmModal && (
                                <Alert variant="destructive">
                                    <AlertTitle>Could not continue</AlertTitle>
                                    <AlertDescription>{validationError}</AlertDescription>
                                </Alert>
                            )}

                            <div className={cn('grid gap-4', 'lg:grid-cols-12 lg:items-start lg:gap-x-6 lg:gap-y-3')}>
                                <div className="space-y-3 lg:col-span-7">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                                        <span className="text-muted-foreground">Employee</span>
                                        <span className="font-medium text-foreground">{data.employeeName}</span>
                                        <span className="tabular-nums text-muted-foreground">{data.employeeCode}</span>
                                        <Badge variant="outline" className="font-normal">
                                            Balance {year}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground lg:ml-auto">
                                            Now: {dayjs().format('YYYY-MM-DD HH:mm')}
                                        </span>
                                    </div>

                                    <div className="rounded-md border border-dashed bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">{data.remainingLeave}</span> hours remaining
                                        <span className="mx-1.5 text-border">·</span>
                                        {formatHoursToDays(data.remainingLeave)}
                                    </div>

                                    <div className="rounded-lg border bg-card px-3 py-3 sm:px-4 sm:py-4">
                                        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                            <Clock className="size-4 text-muted-foreground" aria-hidden />
                                            Leave details
                                        </h2>

                                        <div className="grid gap-3 sm:max-w-md">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="leave_type" className="text-xs sm:text-sm">
                                                    Leave type
                                                </Label>
                                                <select
                                                    id="leave_type"
                                                    value={data.leaveType}
                                                    onChange={onLeaveTypeChange}
                                                    className="border-input flex h-8 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 md:text-sm"
                                                >
                                                    <option value="hourly">Hourly</option>
                                                    <option value="daily">Daily</option>
                                                </select>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-4">
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="leave_start" className="text-xs sm:text-sm">
                                                        {startLabel}
                                                    </Label>
                                                    <Input
                                                        id="leave_start"
                                                        type={data.leaveType === 'daily' ? 'date' : 'datetime-local'}
                                                        value={
                                                            data.leaveType === 'daily'
                                                                ? data.startDateTime.slice(0, 10)
                                                                : data.startDateTime
                                                        }
                                                        onChange={(e) => setData('startDateTime', e.target.value)}
                                                        aria-invalid={Boolean(fieldErrors.start_at)}
                                                        className="h-8 sm:h-9"
                                                    />
                                                    <InputError message={fieldErrors.start_at} />
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="leave_end" className="text-xs sm:text-sm">
                                                        {endLabel}
                                                    </Label>
                                                    <Input
                                                        id="leave_end"
                                                        type={data.leaveType === 'daily' ? 'date' : 'datetime-local'}
                                                        value={
                                                            data.leaveType === 'daily'
                                                                ? data.endDateTime.slice(0, 10)
                                                                : data.endDateTime
                                                        }
                                                        onChange={(e) => setData('endDateTime', e.target.value)}
                                                        aria-invalid={Boolean(fieldErrors.end_at)}
                                                        className="h-8 sm:h-9"
                                                    />
                                                    <InputError message={fieldErrors.end_at} />
                                                </div>
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                {data.leaveType === 'daily'
                                                    ? 'Days are inclusive (start and end dates count as full days).'
                                                    : 'End date and time must be after start.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <aside className="space-y-2 rounded-lg border bg-muted/20 p-3 lg:col-span-5 lg:sticky lg:top-4 lg:p-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                        <CalendarRange className="size-4 text-muted-foreground" aria-hidden />
                                        Estimate
                                    </div>
                                    <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{estimateLabel}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {data.leaveType === 'daily'
                                            ? 'Converted to hours on submit (8 hours per day) for your balance.'
                                            : 'Deduction matches the hours between start and end.'}
                                    </p>
                                    {exceedsBalance ? (
                                        <Alert variant="destructive" className="py-2">
                                            <AlertTitle className="text-sm">Over balance</AlertTitle>
                                            <AlertDescription className="text-xs">
                                                This range uses more than your remaining hours. Adjust dates or type.
                                            </AlertDescription>
                                        </Alert>
                                    ) : estimated > 0 ? (
                                        <div className="flex gap-2 rounded-md border bg-background/80 px-2 py-2 text-xs text-muted-foreground">
                                            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                                            Next step submits the request and updates your used hours.
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Pick start and end so the range is valid.</p>
                                    )}
                                </aside>
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col-reverse gap-2 border-t px-6 pt-4 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="leave-request-form"
                            disabled={processing || exceedsBalance || estimated <= 0}
                            className="w-full sm:w-auto"
                        >
                            Submit
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="gap-4 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm leave request</DialogTitle>
                        <DialogDescription>
                            Submitting deducts these hours from your balance. Your manager still approves or declines the request.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 rounded-lg border bg-muted/30 px-3 py-3 text-sm">
                        <p>
                            <span className="text-muted-foreground">Type — </span>
                            <span className="font-medium">{data.leaveType === 'daily' ? 'Daily' : 'Hourly'}</span>
                        </p>
                        <p>
                            <span className="text-muted-foreground">Start — </span>
                            <span className="font-medium">{data.startDateTime}</span>
                        </p>
                        <p>
                            <span className="text-muted-foreground">End — </span>
                            <span className="font-medium">{data.endDateTime}</span>
                        </p>
                        <p>
                            <span className="text-muted-foreground">Requested — </span>
                            <span className="font-medium">
                                {data.leaveType === 'daily'
                                    ? `${calculatedLeave.toFixed(calculatedLeave % 1 === 0 ? 0 : 1)} day${calculatedLeave === 1 ? '' : 's'}`
                                    : `${calculatedLeave.toFixed(1)} hours`}
                            </span>
                        </p>
                        <p>
                            <span className="text-muted-foreground">Remaining before — </span>
                            <span className="font-medium tabular-nums">{data.remainingLeave} hours</span>
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => setShowConfirmModal(false)} disabled={finalizing}>
                            Back
                        </Button>
                        <Button type="button" onClick={handleFinalSubmit} disabled={finalizing}>
                            {finalizing ? 'Submitting…' : 'Confirm & Submit'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
