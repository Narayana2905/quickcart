import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { parseApiError } from './errorMessage';

const sameDeps = (a, b) => a.length === b.length && a.every((v, i) => Object.is(v, b[i]));

// Runs `fetcher(signal)` whenever `deps` change. Gives every data screen the same
// loading / error / reload behaviour (Mandate 10) without repeating it.
// Rule for callers: `deps` must contain primitives (strings, numbers, booleans), never fresh objects.
export default function useFetch(fetcher, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const [seenDeps, setSeenDeps] = useState(deps);

  // Dependencies changed: report "loading" in this same render, so the screen never shows
  // the new inputs next to the old result. (Adjusting state while rendering is allowed;
  // setting it inside the effect is what the lint rule objects to.)
  if (!sameDeps(seenDeps, deps)) {
    setSeenDeps(deps);
    setState((s) => ({ ...s, loading: true, error: null }));
  }

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetcher(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (axios.isCancel(err)) return; // superseded request: ignore silently
        setState({ data: null, loading: false, error: parseApiError(err) });
      });

    return () => controller.abort(); // runs before the next effect and on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, reload };
}