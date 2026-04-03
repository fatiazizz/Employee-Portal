import Modal from '@/components/ui/modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { PackagePlus, Search, Trash2, Warehouse } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Warehouse', href: '/admin/warehouse' },
];

type WarehouseItemRow = {
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

type ProductTemplate = { id: number; name: string; category: string; type: string };
type Country = { id: number; name: string };

function EmptyCell({ children }: { children: React.ReactNode }) {
    const isEmpty = children === '—' || children == null || children === '';
    if (isEmpty) {
        return <span className="text-muted-foreground">—</span>;
    }
    return <>{children}</>;
}

export default function WarehouseIndex() {
    const { warehouseItems = [], productTemplates = [], countries = [], loadError = null } = usePage<{
        warehouseItems: WarehouseItemRow[];
        productTemplates: ProductTemplate[];
        countries: Country[];
        loadError?: string | null;
    }>().props;

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [tableQuery, setTableQuery] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductTemplate | null>(null);
    const [countrySearch, setCountrySearch] = useState('');
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

    const [form, setForm] = useState({
        serial_number: '',
        production_date: '',
        purchase_date: '',
        registered_at: '',
        quantity: 1,
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const filteredProducts = productSearch
        ? productTemplates
              .filter((p) => p.name.toLowerCase().indexOf(productSearch.toLowerCase()) >= 0)
              .slice(0, 50)
        : productTemplates.slice(0, 50);
    const filteredCountries = countrySearch
        ? countries.filter((c) => c.name.toLowerCase().indexOf(countrySearch.toLowerCase()) >= 0).slice(0, 50)
        : countries.slice(0, 50);

    const filteredItems = useMemo(() => {
        const q = tableQuery.trim().toLowerCase();
        if (!q) return warehouseItems;
        return warehouseItems.filter(
            (item) =>
                item.product_name.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                item.type.toLowerCase().includes(q) ||
                String(item.id).includes(q) ||
                (item.serial_number && item.serial_number.toLowerCase().includes(q)) ||
                (item.country && item.country.toLowerCase().includes(q)) ||
                (item.recipient && item.recipient.toLowerCase().includes(q)) ||
                (item.department && item.department.toLowerCase().includes(q)),
        );
    }, [warehouseItems, tableQuery]);

    const openCreateModal = () => {
        setSelectedProduct(null);
        setSelectedCountry(null);
        setProductSearch('');
        setCountrySearch('');
        setForm({ serial_number: '', production_date: '', purchase_date: '', registered_at: '', quantity: 1 });
        setFormError(null);
        setCreateModalOpen(true);
    };

    const handleSubmitCreate = async () => {
        if (!selectedProduct) {
            setFormError('Please select a product.');
            return;
        }
        const isCapital = selectedProduct.type === 'capital';
        if (isCapital && !form.serial_number.trim()) {
            setFormError('Serial number is required for capital goods.');
            return;
        }
        if (isCapital && !selectedCountry) {
            setFormError('Country of manufacture is required for capital goods.');
            return;
        }
        if (!form.purchase_date || !form.registered_at) {
            setFormError('Purchase date and registration date are required.');
            return;
        }
        if (isCapital && !form.production_date) {
            setFormError('Production date is required for capital goods.');
            return;
        }
        const purchaseDate = new Date(form.purchase_date);
        const registeredDate = new Date(form.registered_at);
        if (registeredDate < purchaseDate) {
            setFormError('Date of registration must be on or after date of purchase.');
            return;
        }
        if (form.production_date) {
            const productionDate = new Date(form.production_date);
            if (productionDate >= purchaseDate) {
                setFormError('Date of production must be before date of purchase.');
                return;
            }
        }
        if (isCapital) {
            if (!/^[A-Za-z][0-9]{9}$/.test(form.serial_number)) {
                setFormError('Serial number must be 10 characters: first letter, then 9 digits.');
                return;
            }
        } else if (form.serial_number && !/^[A-Za-z][0-9]{9}$/.test(form.serial_number)) {
            setFormError('Serial number must be 10 characters: first letter, then 9 digits.');
            return;
        }
        setFormError(null);
        setIsSubmitting(true);
        try {
            const payload: Record<string, unknown> = {
                product_template_id: selectedProduct.id,
                purchase_date: form.purchase_date,
                registered_at: form.registered_at,
                quantity: isCapital ? 1 : Math.max(1, form.quantity),
            };
            const serial = form.serial_number.trim();
            payload.serial_number = serial || null;
            payload.country_id = selectedCountry?.id ?? null;
            const prodDate = form.production_date?.trim?.();
            payload.production_date = prodDate || null;
            await api.post('/admin/warehouse', payload);
            setSuccessMessage('Product registered successfully.');
            setCreateModalOpen(false);
            router.reload();
        } catch (err: any) {
            const data = err?.response?.data;
            const status = err?.response?.status;
            const serverMessage = data?.message;
            const errors = data?.errors;
            let firstError: string | null = null;
            if (errors && typeof errors === 'object') {
                const firstEntry = Object.values(errors).flat();
                firstError = typeof firstEntry[0] === 'string' ? firstEntry[0] : null;
            }
            const msg =
                (serverMessage && serverMessage !== 'The given data was invalid.' ? serverMessage : null) ||
                firstError ||
                serverMessage ||
                (status === 500 ? 'Server error. Check the console or try again.' : 'Failed to register product.');
            setFormError(msg);
            if (process.env.NODE_ENV === 'development' && err?.response) {
                console.error('Warehouse register error', { status, data });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this product from warehouse?')) return;
        try {
            await api.delete(`/admin/warehouse/${id}`);
            setSuccessMessage('Product deleted.');
            router.reload();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Failed to delete.');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Warehouse" />

            <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                            <Warehouse className="size-7 shrink-0 text-muted-foreground" aria-hidden />
                            Warehouse
                        </h1>
                        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                            Registered stock: capital and consumable items. Search the table to find products quickly; use
                            Register to add new inventory.
                        </p>
                    </div>
                    <Button type="button" onClick={openCreateModal} className="w-full shrink-0 sm:w-auto">
                        <PackagePlus className="size-4" aria-hidden />
                        Register product
                    </Button>
                </div>

                {successMessage && (
                    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                        <AlertTitle className="text-emerald-900 dark:text-emerald-100">Done</AlertTitle>
                        <AlertDescription className="flex flex-wrap items-center justify-between gap-2 text-emerald-800 dark:text-emerald-200">
                            {successMessage}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-emerald-900 hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
                                onClick={() => setSuccessMessage(null)}
                            >
                                Dismiss
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {loadError && (
                    <Alert variant="destructive">
                        <AlertTitle>Could not load data</AlertTitle>
                        <AlertDescription>{loadError}</AlertDescription>
                    </Alert>
                )}

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="flex flex-col gap-4 space-y-0 pb-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <CardTitle className="text-lg">Inventory list</CardTitle>
                            <CardDescription>
                                {warehouseItems.length === 0
                                    ? 'No rows yet.'
                                    : tableQuery.trim()
                                      ? `Showing ${filteredItems.length} of ${warehouseItems.length} rows.`
                                      : `${warehouseItems.length} row${warehouseItems.length === 1 ? '' : 's'} total.`}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search product, category, type, serial…"
                                value={tableQuery}
                                onChange={(e) => setTableQuery(e.target.value)}
                                className="h-9 pl-9"
                                aria-label="Filter warehouse table"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 pb-6">
                        {warehouseItems.length === 0 ? (
                            <p className="px-6 text-center text-sm text-muted-foreground">
                                No warehouse items yet. Register a product to start.
                            </p>
                        ) : filteredItems.length === 0 ? (
                            <p className="px-6 text-center text-sm text-muted-foreground">
                                No rows match your search. Try a different term.
                            </p>
                        ) : (
                            <div className="overflow-x-auto border-t border-border">
                                <table className="w-full min-w-[1080px] text-sm">
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
                                            <th className="whitespace-nowrap px-3 py-3">Delivery</th>
                                            <th className="whitespace-nowrap px-3 py-3 pr-4 text-right sm:pr-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredItems.map((item) => (
                                            <tr key={item.id} className="transition-colors hover:bg-muted/40">
                                                <td className="whitespace-nowrap px-3 py-2.5 pl-4 tabular-nums text-muted-foreground sm:pl-6">
                                                    {item.id}
                                                </td>
                                                <td className="max-w-[200px] px-3 py-2.5 font-medium text-foreground">
                                                    <span className="line-clamp-2">{item.product_name}</span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                                                    {item.category}
                                                </td>
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
                                                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">
                                                    <EmptyCell>{item.delivery_date ?? '—'}</EmptyCell>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-2.5 pr-4 text-right sm:pr-6">
                                                    {!item.recipient ? (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <Trash2 className="size-3.5" aria-hidden />
                                                            Delete
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
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

            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)}>
                <div className="p-1 sm:p-0">
                    <h2 className="mb-1 text-lg font-semibold text-foreground">Register product</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Choose a catalog product, then enter dates and optional serial for consumables.
                    </p>

                    <div className="mb-4 grid gap-2">
                        <Label htmlFor="warehouse-product-search">Product (from catalog)</Label>
                        <Input
                            id="warehouse-product-search"
                            type="text"
                            value={selectedProduct ? selectedProduct.name : productSearch}
                            onChange={(e) => {
                                setProductSearch(e.target.value);
                                if (selectedProduct) setSelectedProduct(null);
                                setProductDropdownOpen(true);
                            }}
                            onFocus={() => setProductDropdownOpen(true)}
                            placeholder="Type to search and select…"
                        />
                        {productDropdownOpen && (
                            <ul className="max-h-40 overflow-auto rounded-md border border-border bg-popover text-sm shadow-md">
                                {filteredProducts.map((p) => (
                                    <li
                                        key={p.id}
                                        className="cursor-pointer px-3 py-2 transition-colors hover:bg-muted"
                                        onClick={() => {
                                            setSelectedProduct(p);
                                            setProductSearch('');
                                            setProductDropdownOpen(false);
                                        }}
                                    >
                                        {p.name}{' '}
                                        <span className="text-muted-foreground">({p.type})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {selectedProduct && (
                        <>
                            <div className="mb-4 grid gap-2">
                                <Label htmlFor="warehouse-country-search">
                                    Country of manufacture{' '}
                                    {selectedProduct.type === 'capital' ? '(required)' : '(optional for consumable)'}
                                </Label>
                                <Input
                                    id="warehouse-country-search"
                                    type="text"
                                    value={selectedCountry ? selectedCountry.name : countrySearch}
                                    onChange={(e) => {
                                        setCountrySearch(e.target.value);
                                        if (selectedCountry) setSelectedCountry(null);
                                        setCountryDropdownOpen(true);
                                    }}
                                    onFocus={() => setCountryDropdownOpen(true)}
                                    placeholder="Type to search and select…"
                                />
                                {countryDropdownOpen && (
                                    <ul className="max-h-40 overflow-auto rounded-md border border-border bg-popover text-sm shadow-md">
                                        {filteredCountries.map((c) => (
                                            <li
                                                key={c.id}
                                                className="cursor-pointer px-3 py-2 transition-colors hover:bg-muted"
                                                onClick={() => {
                                                    setSelectedCountry(c);
                                                    setCountrySearch('');
                                                    setCountryDropdownOpen(false);
                                                }}
                                            >
                                                {c.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {selectedProduct.type === 'capital' && (
                                <div className="mb-4 grid gap-2">
                                    <Label htmlFor="warehouse-serial-capital">Serial number (10 chars: 1 letter + 9 digits)</Label>
                                    <Input
                                        id="warehouse-serial-capital"
                                        type="text"
                                        maxLength={10}
                                        value={form.serial_number}
                                        onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                                    />
                                </div>
                            )}
                            {selectedProduct.type === 'consumable' && (
                                <div className="mb-4 grid gap-2">
                                    <Label htmlFor="warehouse-serial-cons">Serial number (optional)</Label>
                                    <Input
                                        id="warehouse-serial-cons"
                                        type="text"
                                        maxLength={10}
                                        value={form.serial_number}
                                        onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                                        placeholder="1 letter + 9 digits"
                                    />
                                </div>
                            )}

                            <div className="mb-4 grid gap-2">
                                <Label htmlFor="warehouse-production">Production date</Label>
                                <Input
                                    id="warehouse-production"
                                    type="date"
                                    value={form.production_date}
                                    onChange={(e) => setForm({ ...form, production_date: e.target.value })}
                                />
                            </div>
                            <div className="mb-4 grid gap-2">
                                <Label htmlFor="warehouse-purchase">Purchase date</Label>
                                <Input
                                    id="warehouse-purchase"
                                    type="date"
                                    value={form.purchase_date}
                                    onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                                />
                            </div>
                            <div className="mb-4 grid gap-2">
                                <Label htmlFor="warehouse-registered">Registration date</Label>
                                <Input
                                    id="warehouse-registered"
                                    type="date"
                                    value={form.registered_at}
                                    onChange={(e) => setForm({ ...form, registered_at: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">Must be on or after the purchase date.</p>
                            </div>
                            {selectedProduct.type === 'consumable' && (
                                <div className="mb-4 grid gap-2">
                                    <Label htmlFor="warehouse-qty">Quantity</Label>
                                    <Input
                                        id="warehouse-qty"
                                        type="number"
                                        min={1}
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value, 10) || 1 })}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {formError && (
                        <p className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {formError}
                        </p>
                    )}

                    <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row">
                        <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" disabled={isSubmitting || !selectedProduct} onClick={handleSubmitCreate}>
                            {isSubmitting ? 'Saving…' : 'Register'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
