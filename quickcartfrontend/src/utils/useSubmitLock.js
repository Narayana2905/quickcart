import { useCallback, useRef, useState } from 'react';

// Mandate 5: a ref blocks repeat clicks instantly; state only drives the disabled look.
// (State updates are async, so two fast clicks can both see busy === false.)
export default function useSubmitLock() {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (task) => {
    if (locked.current) return undefined; // ignore repeat clicks
    locked.current = true;
    setBusy(true);
    try {
      return await task();
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }, []);

  return { busy, run };
}