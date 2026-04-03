import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Users } from 'lucide-react';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehicle Request', href: '/vehicle-request' },
    { title: 'Create', href: '/vehicle-request/create' },
];

type PageProps = SharedData & {
    employee_name: string;
    employee_code: string;
    now: string;
    allUsers: { id: number; name: string }[];
};

const MAX_COMPANIONS = 3;

function companionFieldError(fieldErrors: Record<string, string>): string | undefined {
    const entry = Object.entries(fieldErrors).find(([key]) => key.startsWith('companions'));
    return entry?.[1];
}

export default function CreateVehicle() {
    const { auth, employee_name, employee_code, now, allUsers } = usePage<PageProps>().props;

    const { data, setData, processing, reset } = useForm({
        vehicle_id: '',
        driver_id: '',
        startDateTime: now,
        endDateTime: now,
        origin: '',
        destination: '',
        companions: [] as number[],
    });

    const [validationError, setValidationError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [companionSearch, setCompanionSearch] = useState('');

    const companionOptions = useMemo(
        () => allUsers.filter((user) => user.id !== auth.user.id),
        [allUsers, auth.user.id],
    );

    const filteredCompanions = useMemo(() => {
        const q = companionSearch.trim().toLowerCase();
        if (!q) return companionOptions;
        return companionOptions.filter((u) => u.name.toLowerCase().includes(q));
    }, [companionOptions, companionSearch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setValidationError(null);
        setFieldErrors({});

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
            setValidationError(res?.message ?? 'Something went wrong. Please check the form and try again.');
            console.error('Submit error:', error);
        }
    };

    const handleCancel = () => {
        reset();
        router.visit('/vehicle-request');
    };

    const toggleCompanion = (userId: number, checked: boolean) => {
        if (checked && data.companions.length >= MAX_COMPANIONS) {
            return;
        }
        if (checked) {
            setData('companions', [...data.companions, userId]);
        } else {
            setData(
                'companions',
                data.companions.filter((id) => id !== userId),
            );
        }
    };

    const atCompanionLimit = data.companions.length >= MAX_COMPANIONS;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Vehicle Request" />

            <div className="mx-auto mt-4 w-full max-w-5xl px-4 pb-8">
                <Card className="gap-0 border-border/80 py-4 shadow-md sm:py-5">
                    <CardHeader className="space-y-1 px-6 pb-3 pt-0">
                        <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">New vehicle request</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Trip details below; vehicle and driver are assigned after manager and admin approval.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 pb-2">
                        <form id="vehicle-request-form" onSubmit={handleSubmit} className="space-y-4">
                            {validationError && (
                                <Alert variant="destructive">
                                    <AlertTitle>Could not submit</AlertTitle>
                                    <AlertDescription>{validationError}</AlertDescription>
                                </Alert>
                            )}

                            <div
                                className={cn(
                                    'grid gap-4',
                                    'lg:grid-cols-12 lg:items-start lg:gap-x-6 lg:gap-y-3',
                                )}
                            >
                                <div className="space-y-3 lg:col-span-7">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                                        <span className="text-muted-foreground">Requester</span>
                                        <span className="font-medium text-foreground">{employee_name}</span>
                                        <span className="tabular-nums text-muted-foreground">{employee_code}</span>
                                        <span className="text-xs text-muted-foreground lg:ml-auto">
                                            Now: {dayjs().format('YYYY-MM-DD HH:mm')}
                                        </span>
                                    </div>

                                    <div className="rounded-lg border bg-card px-3 py-3 sm:px-4 sm:py-4">
                                        <h2 className="mb-3 text-sm font-medium text-foreground">Trip</h2>
                                        <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="origin" className="text-xs sm:text-sm">
                                                    Origin
                                                </Label>
                                                <Input
                                                    id="origin"
                                                    type="text"
                                                    placeholder="e.g. Main office"
                                                    value={data.origin}
                                                    onChange={(e) => setData('origin', e.target.value)}
                                                    required
                                                    aria-invalid={Boolean(fieldErrors.origin)}
                                                    className="h-8 sm:h-9"
                                                />
                                                <InputError message={fieldErrors.origin} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="destination" className="text-xs sm:text-sm">
                                                    Destination
                                                </Label>
                                                <Input
                                                    id="destination"
                                                    type="text"
                                                    placeholder="e.g. Client site"
                                                    value={data.destination}
                                                    onChange={(e) => setData('destination', e.target.value)}
                                                    required
                                                    aria-invalid={Boolean(fieldErrors.destination)}
                                                    className="h-8 sm:h-9"
                                                />
                                                <InputError message={fieldErrors.destination} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="start_at" className="text-xs sm:text-sm">
                                                    Start
                                                </Label>
                                                <Input
                                                    id="start_at"
                                                    type="datetime-local"
                                                    value={data.startDateTime}
                                                    onChange={(e) => setData('startDateTime', e.target.value)}
                                                    aria-invalid={Boolean(fieldErrors.start_at)}
                                                    className="h-8 sm:h-9"
                                                />
                                                <InputError message={fieldErrors.start_at} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="end_at" className="text-xs sm:text-sm">
                                                    End
                                                </Label>
                                                <Input
                                                    id="end_at"
                                                    type="datetime-local"
                                                    value={data.endDateTime}
                                                    onChange={(e) => setData('endDateTime', e.target.value)}
                                                    aria-invalid={Boolean(fieldErrors.end_at)}
                                                    className="h-8 sm:h-9"
                                                />
                                                <InputError message={fieldErrors.end_at} />
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs text-muted-foreground">End must be after start.</p>
                                    </div>
                                </div>

                                <aside className="space-y-2 lg:col-span-5 lg:sticky lg:top-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                            <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                                            Companions
                                        </div>
                                        <Badge variant={atCompanionLimit ? 'secondary' : 'outline'} className="font-normal">
                                            {data.companions.length} / {MAX_COMPANIONS}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Optional — up to 3 colleagues (you are not listed).
                                    </p>
                                    <Label htmlFor="companion_search" className="sr-only">
                                        Find colleague
                                    </Label>
                                    <Input
                                        id="companion_search"
                                        type="search"
                                        placeholder="Search names…"
                                        value={companionSearch}
                                        onChange={(e) => setCompanionSearch(e.target.value)}
                                        className="h-8 sm:h-9"
                                    />

                                    <div
                                        className="max-h-[min(12rem,calc(100vh-24rem))] overflow-y-auto rounded-lg border bg-background sm:max-h-52 lg:max-h-[min(14rem,calc(100vh-20rem))]"
                                        role="group"
                                        aria-label="Colleagues to include as companions"
                                    >
                                        {filteredCompanions.length === 0 ? (
                                            <p className="p-3 text-center text-xs text-muted-foreground sm:text-sm">
                                                {companionSearch.trim() ? 'No match.' : 'No other users.'}
                                            </p>
                                        ) : (
                                            <ul className="divide-y">
                                                {filteredCompanions.map((user) => {
                                                    const checked = data.companions.includes(user.id);
                                                    const disabled = !checked && atCompanionLimit;

                                                    return (
                                                        <li key={user.id}>
                                                            <label
                                                                className={cn(
                                                                    'flex cursor-pointer items-center gap-2 px-2 py-1.5 transition-colors hover:bg-muted/50 sm:gap-2.5 sm:px-2.5 sm:py-2',
                                                                    disabled && 'cursor-not-allowed opacity-60 hover:bg-transparent',
                                                                    checked && 'bg-primary/5',
                                                                )}
                                                            >
                                                                <Checkbox
                                                                    id={`companion-${user.id}`}
                                                                    checked={checked}
                                                                    disabled={disabled}
                                                                    onCheckedChange={(state) =>
                                                                        toggleCompanion(user.id, state === true)
                                                                    }
                                                                />
                                                                <span className="min-w-0 flex-1 truncate text-xs leading-tight sm:text-sm">
                                                                    {user.name}
                                                                </span>
                                                            </label>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>

                                    {atCompanionLimit && (
                                        <p className="text-[11px] text-amber-700 dark:text-amber-500">
                                            Max reached — uncheck to change selection.
                                        </p>
                                    )}
                                    <InputError message={companionFieldError(fieldErrors)} />
                                </aside>
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col-reverse gap-2 border-t px-6 pt-4 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button type="submit" form="vehicle-request-form" disabled={processing} className="w-full sm:w-auto">
                            {processing ? 'Submitting…' : 'Submit request'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
