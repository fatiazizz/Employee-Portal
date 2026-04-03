import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ClipboardList,
    LayoutDashboard,
    Mail,
    Package,
    Truck,
    Users,
    type LucideIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

type RecentRequest = {
    id: number;
    type: string;
    url: string;
    employeeName: string;
    employeeCode: string;
    CreateDate: string;
    status: string;
};

type ManagedUser = {
    id: number;
    name: string;
    email: string;
    code: string;
};

type DashboardProps = SharedData & {
    stats: {
        leave: number;
        vehicle: number;
        recommendation: number;
        equipment: number;
    };
    recentRequests: RecentRequest[];
    managedUsers: ManagedUser[];
};

function statusDisplay(status: string): { label: string; className: string } {
    switch (status) {
        case 'approved':
            return {
                label: 'Approved',
                className: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
            };
        case 'rejected':
            return {
                label: 'Rejected',
                className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300',
            };
        case 'manager_approved':
            return {
                label: 'Awaiting admin',
                className: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
            };
        case 'pending':
            return {
                label: 'Pending',
                className: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
            };
        default:
            return {
                label: status.replace(/_/g, ' '),
                className: 'border-border bg-muted text-muted-foreground',
            };
    }
}

const statCards: {
    key: keyof DashboardProps['stats'];
    title: string;
    href: string;
    icon: LucideIcon;
}[] = [
    { key: 'leave', title: 'Leave', href: '/leave-request', icon: ClipboardList },
    { key: 'vehicle', title: 'Vehicle', href: '/vehicle-request', icon: Truck },
    { key: 'recommendation', title: 'Recommendation', href: '/recommendation-request', icon: Mail },
    { key: 'equipment', title: 'Equipment', href: '/equipment-request', icon: Package },
];

export default function Dashboard() {
    const { stats, recentRequests, managedUsers } = usePage<DashboardProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                            <LayoutDashboard className="size-7 text-muted-foreground" aria-hidden />
                            Dashboard
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            Snapshot of requests that need your attention and the latest activity across leave, vehicle,
                            recommendations, and equipment.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map(({ key, title, href, icon: Icon }) => (
                        <Link
                            key={key}
                            href={href}
                            className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Card
                                className={cn(
                                    'gap-0 border-border/80 py-0 shadow-sm transition-shadow duration-200',
                                    'hover:shadow-md',
                                )}
                            >
                                <CardContent className="flex items-center gap-3 px-3 py-2.5 sm:px-3.5 sm:py-3">
                                    <div
                                        className={cn(
                                            'flex size-8 shrink-0 items-center justify-center rounded-md',
                                            'bg-primary/10 text-primary',
                                        )}
                                    >
                                        <Icon className="size-4" aria-hidden />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium leading-tight text-foreground">{title}</p>
                                        <p className="text-[11px] leading-tight text-muted-foreground">In your queue</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1.5 tabular-nums">
                                        <span className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                            {stats[key]}
                                        </span>
                                        <ArrowRight
                                            className="size-3.5 text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                                            aria-hidden
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Recent requests</CardTitle>
                        <CardDescription>
                            Latest mixed activity from leave, vehicle, recommendations, and equipment (up to 10).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        {recentRequests.length === 0 ? (
                            <p className="px-6 pb-2 text-center text-sm text-muted-foreground">No requests to show yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[640px] text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            <th className="whitespace-nowrap px-4 py-3 sm:pl-6">Employee</th>
                                            <th className="whitespace-nowrap px-4 py-3">Code</th>
                                            <th className="whitespace-nowrap px-4 py-3">Type</th>
                                            <th className="whitespace-nowrap px-4 py-3">Created</th>
                                            <th className="whitespace-nowrap px-4 py-3">Status</th>
                                            <th className="whitespace-nowrap px-4 py-3 text-right sm:pr-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {recentRequests.map((req) => {
                                            const st = statusDisplay(req.status);
                                            return (
                                                <tr key={`${req.url}-${req.id}`} className="transition-colors hover:bg-muted/30">
                                                    <td className="max-w-[160px] truncate px-4 py-3 font-medium text-foreground sm:pl-6">
                                                        {req.employeeName}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                                                        {req.employeeCode}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{req.type}</td>
                                                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                                                        {req.CreateDate}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className={cn('font-normal', st.className)}>
                                                            {st.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-right sm:pr-6">
                                                        <Button variant="ghost" size="sm" className="h-8 px-2 text-primary" asChild>
                                                            <Link href={`/${req.url}-request/${req.id}`}>View</Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {managedUsers.length > 0 && (
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="size-5 text-muted-foreground" aria-hidden />
                                Your team
                            </CardTitle>
                            <CardDescription>People who report to you in the org chart.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[480px] text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            <th className="whitespace-nowrap px-4 py-3 sm:pl-6">Name</th>
                                            <th className="whitespace-nowrap px-4 py-3">Email</th>
                                            <th className="whitespace-nowrap px-4 py-3 sm:pr-6">Code</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {managedUsers.map((u) => (
                                            <tr key={u.id} className="transition-colors hover:bg-muted/30">
                                                <td className="px-4 py-3 font-medium text-foreground sm:pl-6">{u.name}</td>
                                                <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">{u.email}</td>
                                                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground sm:pr-6">
                                                    {u.code}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
