// export default function ConfirmDialog({
//   open, title, message, confirmLabel = 'Confirm', busy = false, onConfirm, onCancel,
// }) {
export default function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  busy = false, onConfirm, onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !busy) onCancel();
      }}
    >
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <h3 id="confirm-title">{title}</h3>
        <p id="confirm-message">{message}</p>
        <div className="modal__actions">
          {/* Safe default: focus lands on Cancel, so Enter never destroys anything */}
          <button type="button" autoFocus onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button type="button" className="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}