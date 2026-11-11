import { useState } from 'react';

// Mandate 11: imageUrl can be null, and a URL can also be broken.
export default function ProductImage({ src, name }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img className="product-image" src={src} alt={name} loading="lazy"
        onError={() => setFailed(true)} />
    );
  }
  return (
    <div className="product-image product-image--placeholder" aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}