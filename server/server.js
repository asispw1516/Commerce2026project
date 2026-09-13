const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'orders.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// ---------- Helpers ----------
function readOrders() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeOrders(orders) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
}

function makeOrderId() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${Date.now().toString().slice(-6)}-${rand}`;
}

// ---------- Routes ----------

// Record a new (simulated) purchase
app.post('/api/checkout', (req, res) => {
  const { customer, items, total } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one item.' });
  }
  if (typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ error: 'Order total is invalid.' });
  }

  const order = {
    orderId: makeOrderId(),
    createdAt: new Date().toISOString(),
    customer: {
      name: (customer && customer.name) || 'Guest',
      email: (customer && customer.email) || '',
    },
    items,
    total,
    status: 'paid (simulated)',
  };

  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);

  res.status(201).json({ orderId: order.orderId });
});

// Admin: list all orders
app.get('/api/orders', (req, res) => {
  res.json(readOrders());
});

app.listen(PORT, () => {
  console.log(`MyShop server running at http://localhost:${PORT}`);
  console.log(`Admin dashboard at http://localhost:${PORT}/admin.html`);
});
