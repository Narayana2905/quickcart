import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

// jsdom doesn't implement scrolling; several pages call it when you change page.
window.scrollTo = vi.fn();

afterEach(() => {
  localStorage.clear(); // never let one test's login leak into the next
  vi.clearAllMocks(); // resets call counts so "toHaveBeenCalledTimes(1)" stays honest
});