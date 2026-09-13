# MyShop

A small e-commerce demo site: browse products, add/remove items from a live-updating
cart, "pay" through a simulated checkout, and view all placed orders from an admin page.

## What was fixed from the original repo

- The original GitHub repo had `frontend.html`, `frontend.css`, and `frontend.js` as
  **folders** (each holding a single `index.html` / `index.css` / `index.js`), left over
  from dragging whole folders into GitHub's uploader instead of the files inside them.
  This project has a normal, flat structure instead.
- Product images used absolute paths (`/photos/...`), which only resolve correctly if a
  server happens to be rooted exactly at the repo root — otherwise the browser looks for
  `photos/` at the drive root and the images 404. Paths are now relative (`photos/...`),
  so images load whether you open the file directly or serve it.
- `frontend.js/index.js` was empty — there was no cart logic at all. It now has a full
  cart, checkout, and admin flow (below).

## Project structure

```
project/
├── public/              # Static frontend — can be opened directly or served
│   ├── index.html        # Storefront
│   ├── admin.html         # Admin dashboard (list of orders)
│   ├── css/
│   │   ├── style.css
│   │   └── admin.css
│   ├── js/
│   │   ├── cart.js         # Cart + checkout logic
│   │   └── admin.js        # Fetches and renders orders for admin.html
│   └── photos/            # Product images
├── server/               # Backend (Node + Express)
│   ├── server.js           # Serves the frontend + order API
│   ├── package.json
│   └── data/orders.json    # Orders are stored here (auto-created)
└── README.md
```

## Running it

You need [Node.js](https://nodejs.org) installed (v18+ recommended).

```bash
cd server
npm install
npm start
```

Then open:
- **Storefront:** http://localhost:3000
- **Admin dashboard:** http://localhost:3000/admin.html

The backend serves the `public/` folder itself, so you only need to run the one server —
no separate frontend server required.

### Running without the backend

You can still open `public/index.html` directly in a browser (double-click it) to browse
products and use the cart. Checkout will still run the full simulated-payment flow, but
since there's no server to talk to, the order won't be saved for the admin page — you'll
see a small note in the success screen when that happens.

## How the cart works

- Clicking **Add to Cart** on a product adds it to an in-memory cart array and immediately
  re-renders the cart drawer, the item count badge, and the total — nothing needs a page
  reload.
- Inside the cart drawer you can increase/decrease quantity or remove an item; totals
  update instantly.
- The cart lives in memory only (resets on page reload) — there's no login system yet, so
  there's nowhere safe to persist a cart per-user. Adding accounts would be the natural
  next step if you want the cart to survive a refresh.

## How checkout ("payment") works

Clicking **Proceed to Checkout** opens a modal asking for a name, email, and fake card
details. There is **no real payment processor** — submitting the form:
1. Shows a short "Processing…" delay to feel like a real checkout.
2. Sends the order (customer info + items + total) to `POST /api/checkout` on the backend.
3. Shows a success screen with a generated order ID.

No real money moves and no real card data is validated or stored — this is purely for
demoing the flow. If you later want a real payment provider, this is the point where
you'd integrate something like Stripe or Khalti/eSewa (common in Nepal) instead of the
simulated delay.

## How the admin dashboard works

`admin.html` calls `GET /api/orders`, which reads every order that's been saved to
`server/data/orders.json`, and renders a table with order ID, date, customer, items
purchased, and total — plus summary stats (orders placed, items sold, total revenue).

This has **no authentication** — anyone who can reach `/admin.html` can see it. That's
fine for a local class project, but before deploying this anywhere public you'd want to
add a login for the admin page (e.g. a simple password check, or a proper auth library)
so random visitors can't see order/customer data.

## Ideas for next steps

- Add product data as a shared JSON file instead of duplicating it in the HTML, so
  editing a price only means changing it in one place.
- Persist the cart (e.g. per logged-in user) so it survives a page refresh.
- Add real authentication for both shoppers and the admin page.
- Swap the simulated payment step for a real provider once you're ready to take real
  payments.
