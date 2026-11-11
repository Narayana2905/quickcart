import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createProduct, getAdminCategories, getAdminProduct, updateProduct, updateProductPrice,
} from '../../api/adminApi';
import useFetch from '../../utils/useFetch';
import useSubmitLock from '../../utils/useSubmitLock';
import { parseApiError } from '../../utils/errorMessage';
import { formatPrice } from '../../utils/formatPrice';
import {
  validateMaxLength, validatePrice, validateProductName, validateQuantity, validateUnit,
} from '../../utils/validators';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import FormField from '../../components/FormField';

const FIELD_ORDER = ['categoryId', 'name', 'description', 'unit', 'imageUrl', 'price', 'initialQuantity'];

const notFound = (
  <EmptyState message="Product not found." action={<Link to="/admin/products">Back to products</Link>} />
);

// One component serves /admin/products/new and /admin/products/:id/edit.
export default function AdminProductForm() {
  const { id } = useParams();
  if (id === undefined) return <CreateLoader />;
  if (!/^\d+$/.test(id)) return notFound; // plain numbers only in API paths
  return <EditLoader key={id} id={Number(id)} />;
}

function CreateLoader() {
  const { data: categories, loading, error, reload } = useFetch((signal) => getAdminCategories(signal), []);
  if (loading) return <Loader />;
  if (error) return <ErrorBanner message={error.message} onRetry={reload} />;
  if (!categories) return null;
  return <ProductEditor categories={categories} />;
}

function EditLoader({ id }) {
  const { data, loading, error, reload } = useFetch(async (signal) => {
    const [categories, product] = await Promise.all([
      getAdminCategories(signal),
      getAdminProduct(id, signal),
    ]);
    return { categories, product };
  }, [id]);

  if (loading) return <Loader />;
  if (error) {
    if (error.code === 'NOT_FOUND') return notFound;
    return <ErrorBanner message={error.message} onRetry={reload} />;
  }
  if (!data) return null;
  return <ProductEditor categories={data.categories} product={data.product} />;
}

function validateDetails(f, creating) {
  const errors = {};
  const add = (field, msg) => { if (msg) errors[field] = msg; };
  if (!f.categoryId) errors.categoryId = 'Choose a category.';
  add('name', validateProductName(f.name));
  add('description', validateMaxLength(f.description, 1000, 'Description'));
  add('unit', validateUnit(f.unit));
  add('imageUrl', validateMaxLength(f.imageUrl, 500, 'Image URL'));
  if (creating) {
    add('price', validatePrice(f.price));
    if (f.initialQuantity.trim()) add('initialQuantity', validateQuantity(f.initialQuantity));
  }
  return errors;
}

// Text in the form -> the A8 body. Empty optional fields become null, as in the contract examples.
const detailsBody = (f) => ({
  categoryId: Number(f.categoryId),
  name: f.name.trim(),
  description: f.description.trim() || null,
  unit: f.unit.trim(),
  imageUrl: f.imageUrl.trim() || null,
});

function ProductEditor({ categories, product }) {
  const navigate = useNavigate();
  const isEdit = Boolean(product);
  const detailsLock = useSubmitLock();
  const priceLock = useSubmitLock();

  const [form, setForm] = useState({
    categoryId: product ? String(product.categoryId) : '',
    name: product?.name ?? '',
    description: product?.description ?? '',
    unit: product?.unit ?? '',
    imageUrl: product?.imageUrl ?? '',
    price: '',
    initialQuantity: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  // Edit only: the separate "Update price" action (A9)
  const [currentPrice, setCurrentPrice] = useState(product?.price ?? null);
  const [priceDraft, setPriceDraft] = useState(product ? product.price.toFixed(2) : '');
  const [priceError, setPriceError] = useState('');
  const [priceNotice, setPriceNotice] = useState('');

  const handleChange = (e) => {
    setNotice('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    return detailsLock.run(async () => {
      setFormError('');
      setNotice('');
      const errors = validateDetails(form, !isEdit);
      setFieldErrors(errors);
      const first = FIELD_ORDER.find((f) => errors[f]);
      if (first) {
        document.getElementById(first)?.focus();
        return;
      }

      try {
        if (isEdit) {
          const updated = await updateProduct(product.id, detailsBody(form));
          setCurrentPrice(updated.price);
          setNotice('Product details saved.');
        } else {
          await createProduct({
            ...detailsBody(form),
            price: Number(form.price.trim()), // text -> number only here, at the boundary
            initialQuantity: form.initialQuantity.trim() ? Number(form.initialQuantity.trim()) : undefined,
          });
          navigate('/admin/products', { state: { notice: `${form.name.trim()} created.` } });
        }
      } catch (err) {
        const { code, message, fieldErrors: serverErrors } = parseApiError(err);
        if (code === 'VALIDATION_ERROR' && Object.keys(serverErrors).length > 0) {
          setFieldErrors(serverErrors);
        } else {
          setFormError(message);
        }
      }
    });
  };

  const handlePrice = (e) => {
    e.preventDefault();
    return priceLock.run(async () => {
      setPriceError('');
      setPriceNotice('');
      const msg = validatePrice(priceDraft);
      if (msg) {
        setPriceError(msg);
        return;
      }
      try {
        const updated = await updateProductPrice(product.id, Number(priceDraft.trim()));
        setCurrentPrice(updated.price);
        setPriceDraft(updated.price.toFixed(2)); // formatting only, no arithmetic
        setPriceNotice('Price updated.');
      } catch (err) {
        const { message, fieldErrors: serverErrors } = parseApiError(err);
        setPriceError(serverErrors.price ?? message);
      }
    });
  };

  return (
    <section className="product-editor">
      <p><Link to="/admin/products">← All products</Link></p>
      <h2>{isEdit ? `Edit ${product.name}` : 'New product'}</h2>

      <form onSubmit={handleSubmit} noValidate className="editor-card">
        <ErrorBanner message={formError} />
        {notice && <p className="notice" role="status">{notice}</p>}

        <FormField id="categoryId" label="Category" as="select" value={form.categoryId}
          onChange={handleChange} error={fieldErrors.categoryId}>
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}{c.active ? '' : ' (inactive)'}</option>
          ))}
        </FormField>
        <FormField id="name" label="Name" value={form.name} onChange={handleChange} error={fieldErrors.name} />
        <FormField id="description" label="Description (optional)" as="textarea" rows={3}
          value={form.description} onChange={handleChange} error={fieldErrors.description} />
        <FormField id="unit" label="Unit (e.g. 500 ml)" value={form.unit}
          onChange={handleChange} error={fieldErrors.unit} />
        <FormField id="imageUrl" label="Image URL (optional)" value={form.imageUrl}
          onChange={handleChange} error={fieldErrors.imageUrl} />

        {!isEdit && (
          <>
            <FormField id="price" label="Price (INR)" inputMode="decimal" placeholder="e.g. 28.00"
              value={form.price} onChange={handleChange} error={fieldErrors.price} />
            <FormField id="initialQuantity" label="Initial stock (optional, defaults to 0)" inputMode="numeric"
              value={form.initialQuantity} onChange={handleChange} error={fieldErrors.initialQuantity} />
          </>
        )}

        {isEdit && (
          <p className="muted">
            Current stock: {product.availableQuantity}.{' '}
            <Link to={`/admin/inventory?q=${encodeURIComponent(product.name)}`}>Change it on the Inventory screen</Link>.
          </p>
        )}

        <div className="address-form__actions">
          <button type="submit" disabled={detailsLock.busy}>
            {detailsLock.busy ? 'Saving...' : isEdit ? 'Save details' : 'Create product'}
          </button>
          <Link to="/admin/products" className="button-link">Cancel</Link>
        </div>
      </form>

      {isEdit && (
        <form onSubmit={handlePrice} noValidate className="editor-card">
          <h3>Price</h3>
          <p>Current price: <strong>{formatPrice(currentPrice)}</strong></p>
          <FormField id="priceDraft" label="New price (INR)" inputMode="decimal"
            value={priceDraft}
            onChange={(e) => { setPriceNotice(''); setPriceDraft(e.target.value); }}
            error={priceError} />
          <p className="muted">Carts show the new price immediately. Existing orders keep the price they were placed at.</p>
          <button type="submit" disabled={priceLock.busy}>
            {priceLock.busy ? 'Updating...' : 'Update price'}
          </button>
          {priceNotice && <p className="notice" role="status">{priceNotice}</p>}
        </form>
      )}
    </section>
  );
}