import { useState } from 'react';
import { createAddress, deleteAddress, getAddresses, updateAddress } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import useFetch from '../utils/useFetch';
import useSubmitLock from '../utils/useSubmitLock';
import { messageWithDetails, parseApiError } from '../utils/errorMessage';
import Loader from './Loader';
import ErrorBanner from './ErrorBanner';
import EmptyState from './EmptyState';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';
import ConfirmDialog from './ConfirmDialog';

const MAX_ADDRESSES = 5;
const BLANK = {
  label: '', recipientName: '', phone: '', line1: '', line2: '',
  city: '', state: '', pincode: '', isDefault: false,
};

const toFormValues = (a) => ({
  label: a.label, recipientName: a.recipientName, phone: a.phone, line1: a.line1,
  line2: a.line2 ?? '', city: a.city, state: a.state, pincode: a.pincode, isDefault: a.isDefault,
});

// U7 replaces the whole address, so "set as default" re-sends every field.
const toRequest = (a) => ({
  label: a.label, recipientName: a.recipientName, phone: a.phone, line1: a.line1,
  line2: a.line2, city: a.city, state: a.state, pincode: a.pincode, isDefault: true,
});

export default function AddressSection() {
  const { user } = useAuth();
  const { data: addresses, loading, error, reload } = useFetch((signal) => getAddresses(signal), []);
  const { busy, run } = useSubmitLock(); // one lock for every address action on this screen
  const [editing, setEditing] = useState(null); // null | 'new' | an address id
  const [deleting, setDeleting] = useState(null); // the address awaiting confirmation
  const [actionError, setActionError] = useState('');

  if (loading && !addresses) return <Loader />; // refreshes keep the old list visible
  if (error && !addresses) return <ErrorBanner message={error.message} onRetry={reload} />;
  if (!addresses) return null;

  const atLimit = addresses.length >= MAX_ADDRESSES;

  // Form submit: errors are rethrown to AddressForm so it can show them next to the fields.
  const save = (values) =>
    run(async () => {
      setActionError('');
      if (editing === 'new') await createAddress(values);
      else await updateAddress(editing, values);
      setEditing(null);
      reload(); // the server decides who is default now, so ask it
    });

  const makeDefault = (address) =>
    run(async () => {
      setActionError('');
      try {
        await updateAddress(address.id, toRequest(address));
      } catch (err) {
        setActionError(messageWithDetails(parseApiError(err)));
      } finally {
        reload();
      }
    });

  const confirmDelete = () =>
    run(async () => {
      setActionError('');
      try {
        await deleteAddress(deleting.id);
      } catch (err) {
        setActionError(messageWithDetails(parseApiError(err)));
      } finally {
        setDeleting(null);
        reload(); // deleting the default promotes another address (server rule)
      }
    });

  return (
    <div aria-busy={loading}>
      <ErrorBanner message={actionError} />

      {addresses.length === 0 && editing !== 'new' && (
        <EmptyState message="No saved addresses." />
      )}

      <ul className={`address-list${loading ? ' is-refreshing' : ''}`}>
        {addresses.map((a) => (
          <li key={a.id}>
            {editing === a.id ? (
              <AddressForm
                initialValues={toFormValues(a)}
                defaultLocked={a.isDefault}
                submitLabel="Save changes"
                busy={busy}
                onSubmit={save}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <AddressCard
                address={a}
                busy={busy}
                onEdit={() => setEditing(a.id)}
                onDelete={() => setDeleting(a)}
                onMakeDefault={() => makeDefault(a)}
              />
            )}
          </li>
        ))}
      </ul>

      {editing === 'new' ? (
        <AddressForm
          initialValues={{
            ...BLANK,
            recipientName: user?.fullName ?? '',
            isDefault: addresses.length === 0, // contract: the first address is always default
          }}
          defaultLocked={addresses.length === 0}
          busy={busy}
          onSubmit={save}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <button type="button" onClick={() => setEditing('new')} disabled={atLimit || busy}>
          Add address
        </button>
      )}
      {atLimit && (
        <p className="muted">You can save up to {MAX_ADDRESSES} addresses. Delete one to add another.</p>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete address?"
        message={deleting ? `Remove "${deleting.label}" (${deleting.line1})?` : ''}
        confirmLabel="Delete"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => !busy && setDeleting(null)}
      />
    </div>
  );
}