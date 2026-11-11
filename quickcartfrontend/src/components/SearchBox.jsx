import { useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

// The URL is the source of truth for `q` (Back/refresh must work).
// Typing is debounced 300 ms; Enter searches immediately.
export default function SearchBox() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const onProducts = pathname === '/products';
  const urlQ = onProducts ? params.get('q') ?? '' : '';

  const [text, setText] = useState(urlQ);
  const [seenUrlQ, setSeenUrlQ] = useState(urlQ);
  const timer = useRef(null);

  // URL -> input (Back button, filters cleared elsewhere).
  // Adjusting state while rendering is the React-endorsed way to follow a changing value.
  if (urlQ !== seenUrlQ) {
    setSeenUrlQ(urlQ);
    if (text.trim() !== urlQ) setText(urlQ);
  }

  const applySearch = (value) => {
    const q = value.trim();
    if (!onProducts && !q) return; // erasing text on Home must not drag you to /products
    const next = new URLSearchParams(onProducts ? params : undefined);
    if (q) next.set('q', q);
    else next.delete('q');
    next.delete('page'); // new query => back to first page
    navigate({ pathname: '/products', search: next.toString() });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => applySearch(value), 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(timer.current);
    applySearch(text);
  };

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        aria-label="Search products"
        placeholder="Search products"
        value={text}
        onChange={handleChange}
      />
    </form>
  );
}