// export default function FormField({ id, label, error, ...inputProps }) {
//   return (
//     <div className="form-field">
//       <label htmlFor={id}>{label}</label>
//       <input
//         id={id}
//         name={id}
//         aria-invalid={error ? 'true' : 'false'}
//         aria-describedby={error ? `${id}-error` : undefined}
//         {...inputProps}
//       />
//       {error && (
//         <p id={`${id}-error`} className="form-field__error">{error}</p>
//       )}
//     </div>
//   );
// }
export default function FormField({ id, label, error, as: Control = 'input', ...controlProps }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <Control
        id={id}
        name={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        {...controlProps}
      />
      {error && (
        <p id={`${id}-error`} className="form-field__error">{error}</p>
      )}
    </div>
  );
}