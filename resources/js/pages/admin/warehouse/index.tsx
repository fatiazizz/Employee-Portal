import Modal from '@/components/ui/modal';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

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

export default function WarehouseIndex() {
    const { warehouseItems, productTemplates, countries } = usePage<{
        warehouseItems: WarehouseItemRow[];
        productTemplates: ProductTemplate[];
        countries: Country[];
    }>().props;

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductTemplate | null>(null);
    const [productSearchResults, setProductSearchResults] = useState<ProductTemplate[]>([]);

    const [countrySearch, setCountrySearch] = useState('');
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [countrySearchResults, setCountrySearchResults] = useState<Country[]>([]);

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
        ? productTemplates.filter(
              (p) => p.name.toLowerCase().indexOf(productSearch.toLowerCase()) >= 0,
          ).slice(0, 50)
        : productTemplates.slice(0, 50);
    const filteredCountries = countrySearch
        ? countries.filter(
              (c) => c.name.toLowerCase().indexOf(countrySearch.toLowerCase()) >= 0,
          ).slice(0, 50)
        : countries.slice(0, 50);

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
            <div className="mt-5 mb-4 mr-4 text-right">
                <button
                    onClick={openCreateModal}
                    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                    Register Product
                </button>
            </div>
            <div className="mt-6 rounded-lg bg-white p-6 shadow">
                <h1 className="mb-6 text-xl font-bold text-gray-800">Warehouse List</h1>
                {successMessage && (
                    <div className="mb-4 rounded bg-green-100 px-4 py-2 text-sm text-green-800 shadow">
                        {successMessage}
                    </div>
                )}
                <div className="overflow-auto">
                    <table className="w-full table-auto border-collapse text-left text-sm text-gray-700">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">ID</th>
                                <th className="border px-4 py-2">Product</th>
                                <th className="border px-4 py-2">Category</th>
                                <th className="border px-4 py-2">Type</th>
                                <th className="border px-4 py-2">Serial</th>
                                <th className="border px-4 py-2">Country</th>
                                <th className="border px-4 py-2">Production</th>
                                <th className="border px-4 py-2">Purchase</th>
                                <th className="border px-4 py-2">Registered</th>
                                <th className="border px-4 py-2">Qty</th>
                                <th className="border px-4 py-2">Recipient</th>
                                <th className="border px-4 py-2">Department</th>
                                <th className="border px-4 py-2">Delivery</th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouseItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2">{item.id}</td>
                                    <td className="border px-4 py-2">{item.product_name}</td>
                                    <td className="border px-4 py-2">{item.category}</td>
                                    <td className="border px-4 py-2 capitalize">{item.type}</td>
                                    <td className="border px-4 py-2">{item.serial_number ?? '—'}</td>
                                    <td className="border px-4 py-2">{item.country ?? '—'}</td>
                                    <td className="border px-4 py-2">{item.production_date ?? '—'}</td>
                                    <td className="border px-4 py-2">{item.purchase_date}</td>
                                    <td className="border px-4 py-2">{item.registered_at}</td>
                                    <td className="border px-4 py-2">{item.quantity}</td>
                                    <td className="border px-4 py-2">{item.recipient ?? '—'}</td>
                                    <td className="border px-4 py-2">{item.department ?? '—'}</td>
                                    <td className="border px-4 py-2">{item.delivery_date ?? '—'}</td>
                                    <td className="border px-4 py-2">
                                        {!item.recipient && (
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {warehouseItems.length === 0 && (
                    <p className="py-4 text-center text-gray-500">No warehouse items yet. Register a product to start.</p>
                )}
            </div>

            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)}>
                <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">Register Product</h2>

                    <div className="mb-3">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Product name (select from list)</label>
                        <input
                            type="text"
                            value={selectedProduct ? selectedProduct.name : productSearch}
                            onChange={(e) => {
                                setProductSearch(e.target.value);
                                if (selectedProduct) setSelectedProduct(null);
                                setProductDropdownOpen(true);
                            }}
                            onFocus={() => setProductDropdownOpen(true)}
                            placeholder="Type to search and select..."
                            className="w-full rounded border px-3 py-2"
                        />
                        {productDropdownOpen && (
                            <ul className="max-h-40 overflow-auto rounded border bg-white shadow">
                                {filteredProducts.map((p) => (
                                    <li
                                        key={p.id}
                                        className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                        onClick={() => {
                                            setSelectedProduct(p);
                                            setProductSearch('');
                                            setProductDropdownOpen(false);
                                        }}
                                    >
                                        {p.name} ({p.type})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {selectedProduct && (
                        <>
                            <div className="mb-3">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Country of manufacture {selectedProduct.type === 'capital' ? '*' : '(optional for consumable)'}
                                </label>
                                <input
                                    type="text"
                                    value={selectedCountry ? selectedCountry.name : countrySearch}
                                    onChange={(e) => {
                                        setCountrySearch(e.target.value);
                                        if (selectedCountry) setSelectedCountry(null);
                                        setCountryDropdownOpen(true);
                                    }}
                                    onFocus={() => setCountryDropdownOpen(true)}
                                    placeholder="Type to search and select..."
                                    className="w-full rounded border px-3 py-2"
                                />
                                {countryDropdownOpen && (
                                    <ul className="max-h-40 overflow-auto rounded border bg-white shadow">
                                        {filteredCountries.map((c) => (
                                            <li
                                                key={c.id}
                                                className="cursor-pointer px-3 py-2 hover:bg-gray-100"
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
                                <div className="mb-3">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Serial number * (10 chars: 1 letter + 9 digits)</label>
                                    <input
                                        type="text"
                                        maxLength={10}
                                        value={form.serial_number}
                                        onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                                        className="w-full rounded border px-3 py-2"
                                    />
                                </div>
                            )}
                            {selectedProduct.type === 'consumable' && (
                                <div className="mb-3">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Serial number (optional)</label>
                                    <input
                                        type="text"
                                        maxLength={10}
                                        value={form.serial_number}
                                        onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                                        placeholder="1 letter + 9 digits"
                                        className="w-full rounded border px-3 py-2"
                                    />
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Production date</label>
                                <input
                                    type="date"
                                    value={form.production_date}
                                    onChange={(e) => setForm({ ...form, production_date: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Purchase date *</label>
                                <input
                                    type="date"
                                    value={form.purchase_date}
                                    onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Registration date * (must be on or after purchase date)</label>
                                <input
                                    type="date"
                                    value={form.registered_at}
                                    onChange={(e) => setForm({ ...form, registered_at: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                />
                            </div>
                            {selectedProduct.type === 'consumable' && (
                                <div className="mb-3">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value, 10) || 1 })}
                                        className="w-full rounded border px-3 py-2"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {formError && <p className="mb-2 text-sm text-red-600">{formError}</p>}

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
                            onClick={() => setCreateModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isSubmitting || !selectedProduct}
                            onClick={handleSubmitCreate}
                            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Register'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
