# QuickCart Frontend

React 18 + Vite (JavaScript) single-page app for QuickCart. The API contract is the
**Master Architecture Contract v1.0** (`docs/`); this app calls only the endpoints in its Section 8.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

## Three ways to run

| Mode | `.env` | Needs |
|---|---|---|
| **Mock API** (default while the backend is unavailable) | `VITE_USE_MOCK_API=true`, `VITE_API_BASE_URL=` | nothing |
| **Real backend, dev server** | `VITE_USE_MOCK_API=false`, `VITE_API_BASE_URL=` | gateway on `localhost:8080` (Vite proxies `/api`) |
| **Docker** | (build args only) | `docker compose up --build` from the repo root, then http://localhost:3000 |

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | dev server on port 5173 (fixed) |
| `npm run build` | production build into `dist/` |
| `npm run preview` | serve the build on port 4173 |
| `npm test` | Vitest + React Testing Library (API layer is mocked, no backend needed) |
| `npm run lint` | ESLint |

## Environment variables

| Variable | Meaning |
|---|---|
| `VITE_API_BASE_URL` | Empty = same origin (Docker, AWS, Vite proxy). `http://localhost:8080` = direct to the gateway (needs CORS for the page's origin). |
| `VITE_USE_MOCK_API` | `true` serves the API from the in-browser mock. Always `false` in Docker builds. |

## Accounts

| Where | Admin | Customer |
|---|---|---|
| Mock | `admin@quickcart.local` / `Admin12345` | `asha@example.com` / `Passw0rd123` |
| Real stack | `ADMIN_EMAIL` / `ADMIN_PASSWORD` from the backend `.env` | register in the app |

## Mock helpers (browser console, mock mode only)

`resetMockDb()` restores the seed data. `mockCatalog.setStock(id, qty)` and `mockCatalog.setActive(id, bool)`
simulate the store changing under a customer. `mockOrders.addDemo(userId, n)` adds orders for paging tests,
`mockOrders.raceOnce(productId)` makes stock vanish during checkout, and `mockOrders.catalogDown(true)` makes
order cancellation fail with 503.

## Structure

```
src/api/         one module per backend area; the ONLY place that knows URLs
src/context/     AuthContext, CartContext
src/components/  shared UI (forms, dialogs, cards, badges)
src/pages/       customer/, admin/, auth/
src/utils/       formatting, validation, error parsing, hooks (useFetch, useSubmitLock)
src/mocks/       temporary mock API (MSW + localStorage database)
src/test/        tests, fixtures, render helper
```

## Rules that matter

- Prices and totals are **displayed**, never calculated. All errors go through `utils/errorMessage.js`.
- After every cart change the cart is replaced with the server's response.
- Every submit button is protected against double clicks.
- The UI hides what a role cannot use, and routes are guarded too. The server is the real authority.

## Known limitations (accepted in the contract)

Token is stored in `localStorage` (XSS exposure), there are no refresh tokens (log in again after 1 hour),
and there is no HTTPS unless a domain and TLS are added at deployment.