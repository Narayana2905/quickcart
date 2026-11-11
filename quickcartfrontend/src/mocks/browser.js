import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { db, resetMockDb } from './db';
import { raceControl } from './handlers/orders';
import { catalogControl } from './handlers/adminOrders';
window.mockOrders = {
  // mockOrders.addDemo(2, 12): 12 extra delivered orders for Asha, to test paging
  addDemo: (userId = 2, count = 12) => db.addDemoOrders(userId, count),
  // mockOrders.raceOnce(5): on the next order, product 5 sells out just before reserve
  raceOnce: (productId) => {
    raceControl.productId = productId;
  },
  // mockOrders.catalogDown(true): cancelling an order now fails with 503 (status unchanged)
  catalogDown: (down = true) => {
    catalogControl.down = down;
  },
};
// Dev helpers to simulate "the store changed behind the customer's back".
window.mockCatalog = {
  setStock: (productId, quantity) => db.setStock(productId, quantity),
  setActive: (productId, active) => db.setProductActive(productId, active),
};
export const worker = setupWorker(...handlers);

// Dev convenience: type resetMockDb() in the browser console to restore seed data.
window.resetMockDb = () => {
  resetMockDb();
  console.info('Mock DB reset. Reload the page.');
};
