// Temporary dev database. Persisted in localStorage so data survives refresh.
const DB_KEY = 'quickcart.mockdb';

// ---- Helpers used while building the seed data.
// They must stay ABOVE `let state = load()` below, because that line runs at import time. ----
export function formatOrderNumber(seq, isoDate) {
  return `QC${isoDate.slice(0, 10).replace(/-/g, '')}-${String(seq).padStart(6, '0')}`;
}

const HOME_ADDRESS = {
  recipientName: 'Asha Rao', phone: '9876543210', line1: '12 MG Road', line2: 'Near Park',
  city: 'Hyderabad', state: 'Telangana', pincode: '500001',
};

const orderLine = (productId, productName, unitPrice, quantity) => ({
  productId, productName, unitPrice, quantity, lineTotal: unitPrice * quantity,
});

function seedOrder(id, createdAt, status, paymentMethod, paymentStatus, items, deliveryFee) {
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return {
    id, orderNumber: formatOrderNumber(id, createdAt), userId: 2, status, paymentMethod, paymentStatus,
    subtotal, deliveryFee, total: subtotal + deliveryFee, deliveryAddress: HOME_ADDRESS,
    items, createdAt, updatedAt: createdAt,
  };
}

// [id, name, description, active]
const CATEGORY_ROWS = [
  [1, 'Fruits & Vegetables', 'Fresh fruits and vegetables', true],
  [2, 'Dairy & Eggs', 'Milk, curd, eggs', true],
  [3, 'Bakery', 'Bread and buns', true],
  [4, 'Snacks', 'Chips and munchies', true],
  [5, 'Beverages', 'Juices and soft drinks', true],
  [6, 'Frozen Foods', 'Inactive on purpose: must never show to customers', false],
];

// [categoryId, name, description|null, unit, price]  (id = row position, starting at 1)
// Some descriptions are null on purpose (Mandate 11: null safety).
const PRODUCT_ROWS = [
  [1, 'Banana', 'Ripe yellow bananas', '1 dozen', 49],
  [1, 'Tomato', null, '500 g', 30],
  [1, 'Onion', 'Fresh red onions', '1 kg', 40],
  [1, 'Potato', null, '1 kg', 35],
  [2, 'Toned Milk', 'Fresh toned milk', '500 ml', 28],
  [2, 'Curd', 'Thick set curd', '400 g', 35],
  [2, 'Eggs', null, '6 pcs', 54],
  [2, 'Paneer', 'Soft fresh paneer', '200 g', 90],
  [3, 'Brown Bread', 'Whole wheat sandwich bread', '400 g', 45],
  [3, 'Milk Bread', null, '400 g', 40],
  [3, 'Butter Croissant', 'Flaky and buttery', '2 pcs', 60],
  [3, 'Pav', 'Soft dinner buns', '6 pcs', 30],
  [4, 'Potato Chips', 'Classic salted', '52 g', 20],
  [4, 'Salted Peanuts', null, '200 g', 50],
  [4, 'Marie Biscuits', 'Light tea-time biscuits', '250 g', 30],
  [4, 'Namkeen Mix', null, '200 g', 55],
  [5, 'Orange Juice', 'No added sugar', '1 l', 110],
  [5, 'Cola', 'Chilled soft drink', '750 ml', 40],
  [5, 'Green Tea', 'Pack of 25 tea bags', '25 bags', 140],
  [5, 'Mineral Water', null, '1 l', 20],
];

// Dev-only variations so every UI state can be exercised (contract seed is 50 each).
const STOCK_OVERRIDES = { 8: 0, 12: 3 }; // Paneer out of stock, Pav low
const INACTIVE_PRODUCT_IDS = [20]; // Mineral Water hidden from customers

function seed() {
  const now = new Date().toISOString();
  const products = PRODUCT_ROWS.map(([categoryId, name, description, unit, price], i) => ({
    id: i + 1, categoryId, name, description, price, unit,
    imageUrl: null, active: !INACTIVE_PRODUCT_IDS.includes(i + 1),
  }));
  return {
    nextUserId: 3,
    carts: {}, // userId -> [{ productId, quantity }]  (note: prices are never stored, per contract)
    nextAddressId: 3,
    nextOrderId: 4,
    orderSeq: 3,
    nextCategoryId: 7,
    nextProductId: 21,
    inventoryUpdated: {}, // productId -> ISO time of the last stock change
    orders: [
      seedOrder(1, '2026-11-01T10:15:30Z', 'DELIVERED', 'MOCK_PAYMENT', 'PAID',
        [orderLine(5, 'Toned Milk', 28, 2), orderLine(6, 'Curd', 35, 1)], 25),
      seedOrder(2, '2026-11-03T08:30:00Z', 'OUT_FOR_DELIVERY', 'COD', 'PENDING',
        [orderLine(9, 'Brown Bread', 45, 2), orderLine(7, 'Eggs', 54, 1)], 25),
      seedOrder(3, '2026-11-04T18:45:10Z', 'CANCELLED', 'COD', 'PENDING',
        [orderLine(18, 'Cola', 40, 2)], 25),
    ],
    addresses: [
      { id: 1, userId: 2, label: 'Home', recipientName: 'Asha Rao', phone: '9876543210',
        line1: '12 MG Road', line2: 'Near Park', city: 'Hyderabad', state: 'Telangana',
        pincode: '500001', isDefault: true },
      { id: 2, userId: 2, label: 'Work', recipientName: 'Asha Rao', phone: '9876543210',
        line1: '4 Cyber Towers', line2: null, city: 'Hyderabad', state: 'Telangana',
        pincode: '500081', isDefault: false },
    ],
    users: [
      {
        id: 1, fullName: 'Store Admin', email: 'admin@quickcart.local',
        password: 'Admin12345', phone: '9000000000', role: 'ADMIN',
        active: true, createdAt: now,
      },
      {
        id: 2, fullName: 'Asha Rao', email: 'asha@example.com',
        password: 'Passw0rd123', phone: '9876543210', role: 'CUSTOMER',
        active: true, createdAt: now,
      },
    ],
    categories: CATEGORY_ROWS.map(([id, name, description, active]) => ({
      id, name, description, imageUrl: null, active,
    })),
    products,
    inventory: Object.fromEntries(products.map((p) => [p.id, STOCK_OVERRIDES[p.id] ?? 50])),
  };
}

// Like a Flyway migration: data saved by an older version of the mock keeps what it has
// (users, orders...) and gains whatever is new.
function load() {
  const base = seed();
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return { ...base, ...JSON.parse(raw) };
  } catch {
    /* corrupt data: fall through to a fresh seed */
  }
  return base;
}

let state = load();

function save() {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
}

export const db = {
  // users
  findUserByEmail(email) {
    return state.users.find((u) => u.email === email) || null;
  },
  findUserById(id) {
    return state.users.find((u) => u.id === id) || null;
  },
  addUser({ fullName, email, password, phone }) {
    const user = {
      id: state.nextUserId++, fullName, email, password, phone,
      role: 'CUSTOMER', // contract: role is always CUSTOMER on register
      active: true, createdAt: new Date().toISOString(),
    };
    state.users.push(user);
    save();
    return user;
  },
  updateUser(id, changes) {
    const user = state.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, changes);
    save();
    return user;
  },

  // catalog (read-only for now; Step 8 admin handlers will write here)
  inventoryUpdatedAt(productId) {
    return state.inventoryUpdated[productId] ?? null;
  },
  addCategory({ name, description, imageUrl }) {
    const now = new Date().toISOString();
    const category = {
      id: state.nextCategoryId, name, description, imageUrl, active: true, createdAt: now, updatedAt: now,
    };
    state.nextCategoryId += 1;
    state.categories.push(category);
    save();
    return category;
  },
  updateCategory(id, changes) {
    const category = state.categories.find((c) => c.id === id);
    if (!category) return null;
    Object.assign(category, changes, { updatedAt: new Date().toISOString() });
    save();
    return category;
  },
  addProduct(fields, initialQuantity) {
    const now = new Date().toISOString();
    const product = {
      id: state.nextProductId, ...fields, active: true, createdAt: now, updatedAt: now,
    };
    state.nextProductId += 1;
    state.products.push(product);
    state.inventory[product.id] = initialQuantity;
    state.inventoryUpdated[product.id] = now;
    save();
    return product;
  },
  updateProduct(id, changes) {
    const product = state.products.find((p) => p.id === id);
    if (!product) return null;
    Object.assign(product, changes, { updatedAt: new Date().toISOString() });
    save();
    return product;
  },
  categories() {
    return state.categories;
  },
  products() {
    return state.products;
  },
  stock(productId) {
    return state.inventory[productId] ?? 0;
  },
  // dev helpers for testing unavailable lines (see browser.js); Step 8 admin handlers will reuse them
  // setStock(productId, quantity) {
  //   state.inventory[productId] = quantity;
  //   save();
  // },
  setStock(productId, quantity) {
    state.inventory[productId] = quantity;
    state.inventoryUpdated[productId] = new Date().toISOString();
    save();
  },
  setProductActive(productId, active) {
    const product = state.products.find((p) => p.id === productId);
    if (product) product.active = active;
    save();
  },

  // cart (stores only productId + quantity, like cart_items in the contract)
  cartItems(userId) {
    return state.carts[userId] ?? [];
  },
  saveCartItems(userId, items) {
    state.carts[userId] = items;
    save();
  },

  // addresses
  addressesOf(userId) {
    return state.addresses.filter((a) => a.userId === userId);
  },
  saveAddresses(userId, list) {
    state.addresses = [...state.addresses.filter((a) => a.userId !== userId), ...list];
    save();
  },
  nextAddressId() {
    const id = state.nextAddressId;
    state.nextAddressId += 1;
    return id;
  },

  // orders
  allOrders() {
    return state.orders;
  },
  ordersOf(userId) {
    return state.orders.filter((o) => o.userId === userId);
  },
  findOrder(id) {
    return state.orders.find((o) => o.id === id) || null;
  },
  updateOrder(id, changes) {
    const order = state.orders.find((o) => o.id === id);
    if (!order) return null;
    Object.assign(order, changes);
    save();
    return order;
  },
  // like `order_number_seq`: one global sequence, shared by all users
  reserveOrderIdentity(createdAtIso) {
    const id = state.nextOrderId;
    state.nextOrderId += 1;
    state.orderSeq += 1;
    return { id, orderNumber: formatOrderNumber(state.orderSeq, createdAtIso) };
  },
  addOrder(order) {
    state.orders.push(order);
    save();
  },
  // dev helper for testing paging: db.addDemoOrders(2, 12)
  addDemoOrders(userId, count) {
    for (let i = 0; i < count; i += 1) {
      const createdAt = new Date(Date.now() - i * 3600000).toISOString();
      const { id, orderNumber } = this.reserveOrderIdentity(createdAt);
      state.orders.push({
        id, orderNumber, userId, status: 'DELIVERED', paymentMethod: 'MOCK_PAYMENT', paymentStatus: 'PAID',
        subtotal: 49, deliveryFee: 25, total: 74, deliveryAddress: HOME_ADDRESS,
        items: [orderLine(1, 'Banana', 49, 1)], createdAt, updatedAt: createdAt,
      });
    }
    save();
  },
};

export function resetMockDb() {
  state = seed();
  save();
}