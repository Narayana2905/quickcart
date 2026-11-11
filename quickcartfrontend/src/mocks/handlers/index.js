// import { authHandlers } from './auth';
// import { catalogHandlers } from './catalog';
// import { cartHandlers } from './cart';
// import { userHandlers } from './users';
// import { orderHandlers } from './orders';

// export const handlers = [
//   ...authHandlers, ...catalogHandlers, ...cartHandlers, ...userHandlers, ...orderHandlers,
// ];
import { authHandlers } from './auth';
import { catalogHandlers } from './catalog';
import { cartHandlers } from './cart';
import { userHandlers } from './users';
import { orderHandlers } from './orders';
import { adminOrderHandlers } from './adminOrders';
import { adminCatalogHandlers } from './adminCatalog';

export const handlers = [
  ...authHandlers, ...catalogHandlers, ...cartHandlers, ...userHandlers,
  ...orderHandlers, ...adminOrderHandlers, ...adminCatalogHandlers,
];