const statsEl = document.getElementById('stats');
const loadingMsg = document.getElementById('loadingMsg');
const table = document.getElementById('ordersTable');
const tbody = document.getElementById('ordersBody');
const refreshBtn = document.getElementById('refreshBtn');
const dailyBody = document.getElementById('dailyBody');
const monthlyBody = document.getElementById('monthlyBody');

function formatRs(amount) {
  return 'RS.' + Number(amount).toLocaleString('en-IN');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

// ---------- Grouping helpers ----------
function groupOrders(orders, granularity) {
  const groups = {};

  orders.forEach(o => {
    const d = new Date(o.createdAt);
    const key = granularity === 'day'
      ? d.toLocaleDateString('en-CA') // sortable YYYY-MM-DD
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!groups[key]) groups[key] = { key, orders: 0, items: 0, revenue: 0, sampleDate: d };
    groups[key].orders += 1;
    groups[key].items += o.items.reduce((s, i) => s + i.qty, 0);
    groups[key].revenue += o.total;
  });

  return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
}

function formatDayLabel(group) {
  return group.sampleDate.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatMonthLabel(group) {
  return group.sampleDate.toLocaleDateString(undefined, {
    year: 'numeric', month: 'long',
  });
}

function renderBreakdown(tbodyEl, groups, labelFn) {
  if (groups.length === 0) {
    tbodyEl.innerHTML = `<tr><td colspan="4" class="breakdown-empty">No data yet.</td></tr>`;
    return;
  }
  tbodyEl.innerHTML = groups.map(g => `
    <tr>
      <td>${labelFn(g)}</td>
      <td>${g.orders}</td>
      <td>${g.items}</td>
      <td>${formatRs(g.revenue)}</td>
    </tr>
  `).join('');
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

  renderBreakdown(dailyBody, groupOrders(orders, 'day'), formatDayLabel);
  renderBreakdown(monthlyBody, groupOrders(orders, 'month'), formatMonthLabel);

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
        <td><button class="delete-order-btn" data-id="${o.orderId}">Delete</button></td>
      </tr>
    `)
    .join('');
}

tbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('.delete-order-btn');
  if (!btn) return;

  const orderId = btn.dataset.id;
  if (!confirm(`Delete order ${orderId}? This can't be undone.`)) return;

  btn.disabled = true;
  btn.textContent = 'Deleting…';

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Delete failed');
    loadOrders();
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Delete';
    alert("Couldn't delete that order. Try refreshing and trying again.");
  }
});

refreshBtn.addEventListener('click', loadOrders);
loadOrders();
