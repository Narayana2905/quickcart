// `page` is 0-based (as the API), the label shown to people is 1-based.
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 0}>
        Previous
      </button>
      <span>Page {page + 1} of {totalPages}</span>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}>
        Next
      </button>
    </nav>
  );
}