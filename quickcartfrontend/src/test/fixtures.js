// Test data in the exact DTO shapes from the Handoff. If a shape changes, change it here once.
export const customer = { id: 2, fullName: 'Asha Rao', email: 'asha@example.com', role: 'CUSTOMER' };
export const admin = { id: 1, fullName: 'Store Admin', email: 'admin@quickcart.local', role: 'ADMIN' };

export const product = {
  id: 11, categoryId: 2, categoryName: 'Dairy & Eggs', name: 'Toned Milk', description: 'Fresh toned milk',
  price: 28.0, unit: '500 ml', imageUrl: null, availableQuantity: 40, inStock: true,
};

export const cartLine = {
  productId: 11, name: 'Toned Milk', unit: '500 ml', imageUrl: null, unitPrice: 28.0, quantity: 2,
  lineTotal: 56.0, availableQuantity: 40, available: true,
};

export const cart = {
  items: [cartLine], itemCount: 2, subtotal: 56.0, deliveryFee: 25.0, total: 81.0, hasUnavailableItems: false,
};

export const cartWithUnavailable = {
  items: [
    cartLine,
    {
      productId: 12, name: 'Pav', unit: '6 pcs', imageUrl: null, unitPrice: 0, quantity: 5,
      lineTotal: 0, availableQuantity: 3, available: false,
    },
  ],
  itemCount: 2, subtotal: 56.0, deliveryFee: 25.0, total: 81.0, hasUnavailableItems: true,
};

export const emptyCart = {
  items: [], itemCount: 0, subtotal: 0, deliveryFee: 0, total: 0, hasUnavailableItems: false,
};

export const address = {
  id: 7, label: 'Home', recipientName: 'Asha Rao', phone: '9876543210', line1: '12 MG Road',
  line2: null, city: 'Hyderabad', state: 'Telangana', pincode: '500001', isDefault: true,
};

export const order = {
  id: 42, orderNumber: 'QC20261101-000042', status: 'PLACED', paymentMethod: 'MOCK_PAYMENT',
  paymentStatus: 'PAID', subtotal: 56.0, deliveryFee: 25.0, total: 81.0,
  deliveryAddress: {
    recipientName: 'Asha Rao', phone: '9876543210', line1: '12 MG Road', line2: null,
    city: 'Hyderabad', state: 'Telangana', pincode: '500001',
  },
  items: [{ productId: 11, productName: 'Toned Milk', unitPrice: 28.0, quantity: 2, lineTotal: 56.0 }],
  createdAt: '2026-11-01T10:15:30Z', updatedAt: '2026-11-01T10:15:30Z',
};

export const adminOrder = { ...order, userId: 2 };

// What Axios hands you when the server answers with an error body (contract 12.1).
export const apiFailure = (status, code, message, details = []) => ({
  isAxiosError: true,
  response: { status, data: { status, code, message, details } },
});

// What Axios hands you when there is no response at all (server down, timeout).
export const networkFailure = () => ({ isAxiosError: true });