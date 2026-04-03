import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Filter, Search, ScrollText } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Warehouse Report', href: '/admin/warehouse-report' },
];

type Item = {
    id: number;
    product_name: string;
    category: string;
    type: string;
    serial_number: string | null;
    country: string | null;
    production_date: string | null;
    purchase_date: string;
    registered_at: string;
    quantity: number;
    recipient: string | null;
    department: string | null;
    delivery_date: string | null;
};

function EmptyCell({ children }: { children: React.ReactNode }) {
    const isEmpty = children === '—' || children == null || children === '';
    if (isEmpty) {
        return <span className="text-muted-foreground">—</span>;
    }
    return <>{children}</>;
}

export default function WarehouseReportPage() {
    const { items, departments, filterDepartments } = usePage<{
        items: Item[];
        departments: { id: number; name: string }[];
        filterDepartments?: number[];
    }>().props;

    const [selectedDepartments, setSelectedDepartments] = useState<number[]>(filterDepartments ?? []);
    const [tableQuery, setTableQuery] = useState('');

    const toggleDepartment = (id: number) => {
        setSelectedDepartments((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
    };

    const applyFilter = () => {
        const params = new URLSearchParams();
        selectedDepartments.forEach((id) => params.append('departments[]', String(id)));
        router.get('/admin/warehouse-report', Object.fromEntries(params));
    };

    const clearFilters = () => {
        setSelectedDepartments([]);
        router.get('/admin/warehouse-report');
    };

    const filteredRows = useMemo(() => {
        const q = tableQuery.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (item) =>
                item.product_name.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                item.type.toLowerCase().includes(q) ||
                String(item.id).includes(q) ||
                (item.serial_number && item.serial_number.toLowerCase().includes(q)) ||
                (item.department && item.department.toLowerCase().includes(q)) ||
                (item.recipient && item.recipient.toLowerCase().includes(q)),
        );
    }, [items, tableQuery]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Warehouse Report" />

            <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                        <ScrollText className="size-7 shrink-0 text-muted-foreground" aria-hidden />
                        Warehouse report
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Delivered and assigned items, optionally narrowed by department. Use search to find rows in the current
                        result set.
                    </p>
                </div>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Filter className="size-4 text-muted-foreground" aria-hidden />
                            Department filter
                        </CardTitle>
                        <CardDescription>Select one or more departments, then apply to reload data from the server.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {departments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No departments available.</p>
                        ) : (
                            <div className="flex max-h-40 flex-wrap gap-x-4 gap-y-3 overflow-y-auto">
                                {departments.map((d) => (
                                    <label
                                        key={d.id}
                                        className="flex cursor-pointer items-center gap-2 text-sm leading-none font-medium"
                                    >
                                        <Checkbox
                                            id={`dept-${d.id}`}
                                            checked={selectedDepartments.includes(d.id)}
                                            onCheckedChange={() => toggleDepartment(d.id)}
                                        />
                                        <Label htmlFor={`dept-${d.id}`} className="cursor-pointer font-normal">
                                            {d.name}
                                        </Label>
                                    </label>
                                ))}
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" onClick={applyFilter}>
                                Apply filter
                            </Button>
                            <Button type="button" variant="outline" onClick={clearFilters}>
                                Clear & show all
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="flex flex-col gap-4 space-y-0 pb-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <CardTitle className="text-lg">Report results</CardTitle>
                            <CardDescription>
                                {items.length === 0
                                    ? 'No rows for this filter.'
                                    : tableQuery.trim()
                                      ? `Showing ${filteredRows.length} of ${items.length} rows (search).`
                                      : `${items.length} row${items.length === 1 ? '' : 's'}.`}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search in results…"
                                value={tableQuery}
                                onChange={(e) => setTableQuery(e.target.value)}
                                className="h-9 pl-9"
                                aria-label="Search report table"
                                disabled={items.length === 0}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 pb-6">
                        {items.length === 0 ? (
                            <p className="px-6 text-center text-sm text-muted-foreground">
                                No items match the filter. Clear the department filter or pick different departments.
                            </p>
                        ) : filteredRows.length === 0 ? (
                            <p className="px-6 text-center text-sm text-muted-foreground">No rows match your search.</p>
                        ) : (
                            <div className="overflow-x-auto border-t border-border">
                                <table className="w-full min-w-[1020px] text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            <th className="whitespace-nowrap px-3 py-3 pl-4 sm:pl-6">ID</th>
                                            <th className="whitespace-nowrap px-3 py-3">Product</th>
                                            <th className="whitespace-nowrap px-3 py-3">Category</th>
                                            <th className="whitespace-nowrap px-3 py-3">Type</th>
                                            <th className="whitespace-nowrap px-3 py-3">Serial</th>
                                            <th className="whitespace-nowrap px-3 py-3">Country</th>
                                            <th className="whitespace-nowrap px-3 py-3">Production</th>
                                            <th className="whitespace-nowrap px-3 py-3">Purchase</th>
                                            <th className="whitespace-nowrap px-3 py-3">Registered</th>
                                            <th className="whitespace-nowrap px-3 py-3 text-right">Qty</th>
                                            <th className="whitespace-nowrap px-3 py-3">Recipient</th>
                                            <th className="whitespace-nowrap px-3 py-3">Department</th>
                                            <th className="whitespace-nowrap px-3 py-3 pr-4 sm:pr-6">Delivery</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredRows.map((item) => (
                                            <tr key={item.id} className="transition-colors hover:bg-muted/40">
                                                <td className="whitespace-nowrap px-3 py-2.5 pl-4 tabular-nums text-muted-foreground sm:pl-6">
                                                    {item.id}
                                                </td>
                                                <td className="max-w-[200px] px-3 py-2.5 font-medium text-foreground">
                                                    <span className="line-clamp-2">{item.product_name}</span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{item.category}</td>
                                                <td className="px-3 py-2.5">
                                                    <Badge variant="secondary" className="font-normal capitalize">
                                                        {item.type}
                                                    </Badge>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-muted-foreground">
                                                    <EmptyCell>{item.serial_number ?? '—'}</EmptyCell>
                                                </td>
                                                <td className="max-w-[120px] truncate px-3 py-2.5 text-muted-foreground">
                                                    <EmptyCell>{item.country ?? '—'}</EmptyCell>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">
                                                    <EmptyCell>{item.production_date ?? '—'}</EmptyCell>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">
                                                    {item.purchase_date}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">
                                                    {item.registered_at}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums font-medium">
                                                    {item.quantity}
                                                </td>
                                                <td className="max-w-[140px] truncate px-3 py-2.5 text-muted-foreground">
                                                    <EmptyCell>{item.recipient ?? '—'}</EmptyCell>
                                                </td>
                                                <td className="max-w-[120px] truncate px-3 py-2.5 text-muted-foreground">
                                                    <EmptyCell>{item.department ?? '—'}</EmptyCell>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-2.5 pr-4 tabular-nums text-muted-foreground sm:pr-6">
                                                    <EmptyCell>{item.delivery_date ?? '—'}</EmptyCell>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
