import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Boxes, Filter, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Warehouse Inventory', href: '/admin/warehouse-inventory' },
];

type InventoryRow = {
    product_name: string;
    type: string;
    category: string;
    quantity: number;
};

export default function WarehouseInventoryPage() {
    const { items, allCategories, allTypes, filterTypes, filterCategories } = usePage<{
        items: InventoryRow[];
        allCategories: string[];
        allTypes: string[];
        filterTypes?: string[];
        filterCategories?: string[];
    }>().props;

    const [selectedTypes, setSelectedTypes] = useState<string[]>(filterTypes ?? []);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(filterCategories ?? []);
    const [tableQuery, setTableQuery] = useState('');

    const toggleType = (t: string) => {
        setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
    };
    const toggleCategory = (c: string) => {
        setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
    };

    const applyFilter = () => {
        const params = new URLSearchParams();
        selectedTypes.forEach((t) => params.append('types[]', t));
        selectedCategories.forEach((c) => params.append('categories[]', c));
        router.get('/admin/warehouse-inventory', Object.fromEntries(params));
    };

    const clearFilters = () => {
        setSelectedTypes([]);
        setSelectedCategories([]);
        router.get('/admin/warehouse-inventory');
    };

    const filteredRows = useMemo(() => {
        const q = tableQuery.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (row) =>
                row.product_name.toLowerCase().includes(q) ||
                row.category.toLowerCase().includes(q) ||
                row.type.toLowerCase().includes(q),
        );
    }, [items, tableQuery]);

    const totalQty = useMemo(() => items.reduce((s, r) => s + r.quantity, 0), [items]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Warehouse Inventory" />

            <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                        <Boxes className="size-7 shrink-0 text-muted-foreground" aria-hidden />
                        Warehouse inventory
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Aggregated quantities by product template. Filter by type and category, then search within the loaded
                        results.
                    </p>
                </div>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Filter className="size-4 text-muted-foreground" aria-hidden />
                            Filters
                        </CardTitle>
                        <CardDescription>Choose type and/or category, then apply to reload totals from the server.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="mb-3 text-sm font-medium text-foreground">Type</h3>
                            {allTypes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No types.</p>
                            ) : (
                                <div className="flex flex-wrap gap-x-4 gap-y-3">
                                    {allTypes.map((t, i) => {
                                        const id = `inv-type-${i}`;
                                        return (
                                            <label key={t} className="flex cursor-pointer items-center gap-2 text-sm">
                                                <Checkbox
                                                    id={id}
                                                    checked={selectedTypes.includes(t)}
                                                    onCheckedChange={() => toggleType(t)}
                                                />
                                                <Label htmlFor={id} className="cursor-pointer font-normal capitalize">
                                                    {t}
                                                </Label>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-medium text-foreground">Category</h3>
                            {allCategories.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No categories.</p>
                            ) : (
                                <div className="flex max-h-36 flex-wrap gap-x-4 gap-y-3 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
                                    {allCategories.map((c, i) => {
                                        const id = `inv-cat-${i}`;
                                        return (
                                            <label key={`${c}-${i}`} className="flex cursor-pointer items-center gap-2 text-sm">
                                                <Checkbox
                                                    id={id}
                                                    checked={selectedCategories.includes(c)}
                                                    onCheckedChange={() => toggleCategory(c)}
                                                />
                                                <Label htmlFor={id} className="cursor-pointer font-normal">
                                                    {c}
                                                </Label>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

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
                            <CardTitle className="text-lg">Stock by product</CardTitle>
                            <CardDescription>
                                {items.length === 0
                                    ? 'No lines for this filter.'
                                    : `${items.length} product line${items.length === 1 ? '' : 's'} · ${totalQty} total piece${totalQty === 1 ? '' : 's'}.`}
                                {items.length > 0 && tableQuery.trim()
                                    ? ` Showing ${filteredRows.length} after search.`
                                    : null}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search product, category, type…"
                                value={tableQuery}
                                onChange={(e) => setTableQuery(e.target.value)}
                                className="h-9 pl-9"
                                aria-label="Search inventory table"
                                disabled={items.length === 0}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 pb-6">
                        {items.length === 0 ? (
                            <p className="px-6 text-center text-sm text-muted-foreground">
                                No items match the filter. Adjust type or category filters and apply again.
                            </p>
                        ) : filteredRows.length === 0 ? (
                            <p className="px-6 text-center text-sm text-muted-foreground">No rows match your search.</p>
                        ) : (
                            <div className="overflow-x-auto border-t border-border">
                                <table className="w-full min-w-[520px] text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            <th className="px-4 py-3 pl-6">Product</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3 pr-6 text-right">Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredRows.map((row, idx) => (
                                            <tr key={`${row.product_name}-${row.type}-${idx}`} className="transition-colors hover:bg-muted/40">
                                                <td className="px-4 py-3 pl-6 font-medium text-foreground">{row.product_name}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{row.category}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="secondary" className="font-normal capitalize">
                                                        {row.type}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 pr-6 text-right tabular-nums text-base font-semibold tracking-tight">
                                                    {row.quantity}
                                                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                        piece{row.quantity !== 1 ? 's' : ''}
                                                    </span>
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
