const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'orders.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Admin credentials come from environment variables so they're never
// committed to the repo. Set ADMIN_USER / ADMIN_PASS in Render's
// dashboard under Settings -> Environment. These fallbacks only kick in
// for local development if you forget to set them.
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme';

function requireAdminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');

  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const sepIndex = decoded.indexOf(':');
    const user = decoded.slice(0, sepIndex);
    const pass = decoded.slice(sepIndex + 1);

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      return next();
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="MyShop Admin"');
  return res.status(401).send('Authentication required.');
}

app.use(express.json());

// Protect the admin page itself. This must be registered BEFORE
// express.static, otherwise static would serve admin.html to anyone
// before this auth check ever runs.
app.get('/admin.html', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

app.use(express.static(PUBLIC_DIR));

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

app.get('/api/orders', requireAdminAuth, (req, res) => {
  res.json(readOrders());
});

app.delete('/api/orders/:orderId', requireAdminAuth, (req, res) => {
  const orders = readOrders();
  const remaining = orders.filter(o => o.orderId !== req.params.orderId);

  if (remaining.length === orders.length) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  writeOrders(remaining);
  res.json({ deleted: req.params.orderId });
});

app.listen(PORT, () => {
  console.log(`MyShop server running at http://localhost:${PORT}`);
  console.log(`Admin dashboard at http://localhost:${PORT}/admin.html`);
});
