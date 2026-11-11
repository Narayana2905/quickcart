import FormField from './FormField';

// The seven delivery fields (no label, no default flag: those belong to saved addresses).
export default function DeliveryFields({ form, errors, onChange }) {
  const field = (id, label, extra = {}) => (
    <FormField id={id} label={label} value={form[id]} onChange={onChange}
      error={errors[id]} {...extra} />
  );

  return (
    <div className="address-form__grid">
      {field('recipientName', 'Recipient name', { autoComplete: 'name' })}
      {field('phone', 'Mobile number', { type: 'tel', inputMode: 'numeric', maxLength: 10 })}
      {field('line1', 'Address line 1', { autoComplete: 'address-line1' })}
      {field('line2', 'Address line 2 (optional)', { autoComplete: 'address-line2' })}
      {field('city', 'City')}
      {field('state', 'State')}
      {field('pincode', 'Pincode', { inputMode: 'numeric', maxLength: 6 })}
    </div>
  );
}