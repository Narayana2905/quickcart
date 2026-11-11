import { useState } from 'react';
import {
  createCategory, getAdminCategories, setCategoryActive, updateCategory,
} from '../../api/adminApi';
import useFetch from '../../utils/useFetch';
import useSubmitLock from '../../utils/useSubmitLock';
import { messageWithDetails, parseApiError } from '../../utils/errorMessage';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import CategoryForm from '../../components/CategoryForm';

const BLANK = { name: '', description: '', imageUrl: '' };

export default function AdminCategories() {
  const { data, loading, error, reload } = useFetch((signal) => getAdminCategories(signal), []);
  const { busy, run } = useSubmitLock();
  const [editing, setEditing] = useState(null); // null | 'new' | a category
  const [deactivating, setDeactivating] = useState(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  if (loading && !data) return <Loader />;
  if (error && !data) return <ErrorBanner message={error.message} onRetry={reload} />;
  if (!data) return null;

  // Errors are rethrown to CategoryForm so it can show them next to the fields.
  const save = (values) =>
    run(async () => {
      setActionError('');
      setNotice('');
      const creating = editing === 'new';
      if (creating) await createCategory(values);
      else await updateCategory(editing.id, values);
      setNotice(creating ? 'Category added.' : 'Category saved.');
      setEditing(null);
      reload();
    });

  const applyActive = (category, active) =>
    run(async () => {
      setActionError('');
      setNotice('');
      try {
        await setCategoryActive(category.id, active);
        setNotice(`${category.name} ${active ? 'activated' : 'deactivated'}.`);
      } catch (err) {
        setActionError(messageWithDetails(parseApiError(err)));
      } finally {
        setDeactivating(null);
        reload();
      }
    });

  return (
    <section>
      <div className="page-header">
        <h2>Categories</h2>
        <button type="button" onClick={() => setEditing('new')} disabled={busy}>Add category</button>
      </div>

      {notice && <p className="notice" role="status">{notice}</p>}
      <ErrorBanner message={actionError} />

      {data.length === 0 ? (
        <EmptyState message="No categories yet." />
      ) : (
        <div className={`table-scroll${loading ? ' is-refreshing' : ''}`}>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.description ?? '—'}</td>
                  <td>
                    <span className={`tag${c.active ? '' : ' tag--muted'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="row-actions">
                    <button type="button" onClick={() => setEditing(c)} disabled={busy}>Edit</button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => (c.active ? setDeactivating(c) : applyActive(c, true))}
                    >
                      {c.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal
          title={editing === 'new' ? 'Add category' : 'Edit category'}
          onClose={() => !busy && setEditing(null)}
        >
          <CategoryForm
            key={editing === 'new' ? 'new' : editing.id}
            initialValues={
              editing === 'new'
                ? BLANK
                : { name: editing.name, description: editing.description ?? '', imageUrl: editing.imageUrl ?? '' }
            }
            submitLabel={editing === 'new' ? 'Add category' : 'Save changes'}
            busy={busy}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      <ConfirmDialog
        open={Boolean(deactivating)}
        title="Deactivate category?"
        message={deactivating
          ? `${deactivating.name} and every product in it will be hidden from customers. You can activate it again later.`
          : ''}
        confirmLabel="Deactivate"
        busy={busy}
        onConfirm={() => applyActive(deactivating, false)}
        onCancel={() => !busy && setDeactivating(null)}
      />
    </section>
  );
}