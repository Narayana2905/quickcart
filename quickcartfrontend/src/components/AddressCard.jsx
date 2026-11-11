export default function AddressCard({ address, busy, onEdit, onDelete, onMakeDefault }) {
  return (
    <article className="address-card">
      <header>
        <strong>{address.label}</strong>
        {address.isDefault && <span className="tag">Default</span>}
      </header>
      <p>{address.recipientName} · {address.phone}</p>
      {/* Mandate 11: line2 can be null */}
      <p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
      <p>{address.city}, {address.state} {address.pincode}</p>
      <div className="address-card__actions">
        <button type="button" onClick={onEdit} disabled={busy}>Edit</button>
        {!address.isDefault && (
          <button type="button" onClick={onMakeDefault} disabled={busy}>Set as default</button>
        )}
        <button type="button" onClick={onDelete} disabled={busy}>Delete</button>
      </div>
    </article>
  );
}