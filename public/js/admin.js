const statsEl = document.getElementById('stats');
const loadingMsg = document.getElementById('loadingMsg');
const table = document.getElementById('ordersTable');
const tbody = document.getElementById('ordersBody');
const refreshBtn = document.getElementById('refreshBtn');

function formatRs(amount) {
  return 'RS.' + Number(amount).toLocaleString('en-IN');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

async function loadOrders() {
  loadingMsg.hidden = false;
  loadingMsg.textContent = 'Loading orders…';
  table.hidden = true;

  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Request failed: ' + res.status);
    const orders = await res.json();
    renderOrders(orders);
  } catch (err) {
    loadingMsg.textContent =
      "Couldn't load orders. Make sure the backend server is running (see README: cd server && npm start).";
  }
}

function renderOrders(orders) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalItems = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0),
    0
  );

  statsEl.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Orders placed</div>
      <div class="stat-value">${orders.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Items sold</div>
      <div class="stat-value">${totalItems}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total revenue</div>
      <div class="stat-value">${formatRs(totalRevenue)}</div>
    </div>
  `;

  if (orders.length === 0) {
    loadingMsg.hidden = false;
    loadingMsg.textContent = 'No orders yet. Purchases from the storefront will show up here.';
    table.hidden = true;
    return;
  }

  loadingMsg.hidden = true;
  table.hidden = false;

  tbody.innerHTML = orders
    .slice()
    .reverse()
    .map(o => `
      <tr>
        <td>${o.orderId}</td>
        <td>${formatDate(o.createdAt)}</td>
        <td>${o.customer.name || '—'}<br><span style="color:var(--muted)">${o.customer.email || ''}</span></td>
        <td>
          <ul>
            ${o.items.map(i => `<li>${i.name} &times; ${i.qty}</li>`).join('')}
          </ul>
        </td>
        <td class="order-total-cell">${formatRs(o.total)}</td>
      </tr>
    `)
    .join('');
}

refreshBtn.addEventListener('click', loadOrders);
loadOrders();
