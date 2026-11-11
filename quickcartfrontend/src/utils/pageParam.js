// Reads a safe 0-based page number from the URL. Step 7's admin lists reuse this.
export function readPage(searchParams) {
  const raw = Number.parseInt(searchParams.get('page') ?? '0', 10);
  return Number.isNaN(raw) || raw < 0 ? 0 : raw;
}