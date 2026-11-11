// Mandate 12: UI clamps to 1-20, the server stays authoritative.
export default function QuantityStepper({
  value, onChange, min = 1, max = 20, disabled = false, label = 'Quantity', inputReadOnly = false,
}) {
  const clamp = (n) => Math.min(max, Math.max(min, n));

  const handleInput = (e) => {
    const n = Number.parseInt(e.target.value, 10);
    onChange(Number.isNaN(n) ? min : clamp(n));
  };

  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" aria-label="Decrease quantity"
        onClick={() => onChange(clamp(value - 1))} disabled={disabled || value <= min}>
        −
      </button>
      <input type="number" aria-label={label} min={min} max={max}
        value={value} onChange={handleInput} disabled={disabled} readOnly={inputReadOnly}/>
      <button type="button" aria-label="Increase quantity"
        onClick={() => onChange(clamp(value + 1))} disabled={disabled || value >= max}>
        +
      </button>
    </div>
  );
}
