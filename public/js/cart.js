// ---------- State ----------
let cart = []; // [{ id, name, price, img, qty }]

// ---------- Element refs ----------
const cartToggle = document.getElementById('cartToggle');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');

const checkoutOverlay = document.getElementById('checkoutOverlay');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutSuccess = document.getElementById('checkoutSuccess');
const checkoutError = document.getElementById('checkoutError');
const orderSummaryEl = document.getElementById('orderSummary');
const payForm = document.getElementById('payForm');
const payBtn = document.getElementById('payBtn');
const payAmountEl = document.getElementById('payAmount');
const orderIdEl = document.getElementById('orderId');
const closeSuccessBtn = document.getElementById('closeSuccess');
const toastEl = document.getElementById('toast');
const searchBar = document.getElementById('searchBar');

// ---------- Helpers ----------
function formatRs(amount) {
  return 'RS.' + amount.toLocaleString('en-IN');
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartItemCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ---------- Rendering (runs after every change = "real time") ----------
function renderCart() {
  cartCountEl.textContent = cartItemCount();

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    checkoutBtn.disabled = true;
  } else {
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div class="unit-price">${formatRs(item.price)} each</div>
          <div class="cart-item-controls">
            <button class="qty-btn" data-action="decrease" data-id="${item.id}">&minus;</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
            <button class="remove-item" data-action="remove" data-id="${item.id}">Remove</button>
          </div>
        </div>
        <div class="cart-item-line-total">${formatRs(item.price * item.qty)}</div>
      </div>
    `).join('');
    checkoutBtn.disabled = false;
  }

  cartTotalEl.textContent = formatRs(cartTotal());
}

// ---------- Cart mutations ----------
function addToCart(id, name, price, img) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  renderCart();
  showToast(`${name} added to cart`);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

// ---------- Add-to-cart buttons ----------
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const { id, name, price, img } = btn.dataset;
    addToCart(id, name, Number(price), img);

    // brief visual confirmation on the button itself
    const original = btn.textContent;
    btn.textContent = 'Added ✓';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('added');
    }, 900);
  });
});

// ---------- Cart item controls (qty +/-, remove) via delegation ----------
cartItemsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'increase') changeQty(id, 1);
  else if (action === 'decrease') changeQty(id, -1);
  else if (action === 'remove') removeItem(id);
});

// ---------- Drawer open/close ----------
function openDrawer() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
}
function closeDrawer() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
}
cartToggle.addEventListener('click', openDrawer);
closeCart.addEventListener('click', closeDrawer);
cartOverlay.addEventListener('click', closeDrawer);

// ---------- Search filter ----------
if (searchBar) {
  searchBar.addEventListener('input', () => {
    const q = searchBar.value.trim().toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = !q || text.includes(q) ? '' : 'none';
    });
  });
}

// ---------- Checkout modal ----------
function openCheckout() {
  if (cart.length === 0) return;
  orderSummaryEl.innerHTML = cart.map(item => `
    <div class="order-summary-row">
      <span>${item.name} &times; ${item.qty}</span>
      <span>${formatRs(item.price * item.qty)}</span>
    </div>
  `).join('') + `
    <div class="order-summary-row total">
      <span>Total</span>
      <span>${formatRs(cartTotal())}</span>
    </div>
  `;
  payAmountEl.textContent = formatRs(cartTotal());

  checkoutForm.hidden = false;
  checkoutSuccess.hidden = true;
  checkoutError.hidden = true;
  payForm.reset();
  payBtn.disabled = false;
  payBtn.textContent = `Pay ${formatRs(cartTotal())}`;

  checkoutOverlay.classList.add('open');
}
function closeCheckoutModal() {
  checkoutOverlay.classList.remove('open');
}

checkoutBtn.addEventListener('click', () => {
  closeDrawer();
  openCheckout();
});
closeCheckout.addEventListener('click', closeCheckoutModal);
checkoutOverlay.addEventListener('click', (e) => {
  if (e.target === checkoutOverlay) closeCheckoutModal();
});

// Light formatting helpers for the fake card fields
document.getElementById('cardNumber').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^\d]/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
});
document.getElementById('cardExpiry').addEventListener('input', (e) => {
  let v = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
  e.target.value = v;
});
document.getElementById('cardCvv').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
});

// ---------- Simulated payment + submit order to backend ----------
payForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('custName').value.trim();
  const email = document.getElementById('custEmail').value.trim();

  payBtn.disabled = true;
  payBtn.textContent = 'Processing…';

  const order = {
    customer: { name, email },
    items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    total: cartTotal(),
  };

  // Simulate payment processing delay (no real payment gateway is used)
  await new Promise(res => setTimeout(res, 1200));

  let savedOrderId = 'SIM-' + Date.now().toString().slice(-8);
  let serverReachable = true;

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (res.ok) {
      const data = await res.json();
      savedOrderId = data.orderId || savedOrderId;
    } else {
      serverReachable = false;
    }
  } catch (err) {
    serverReachable = false;
  }

  orderIdEl.textContent = savedOrderId;
  checkoutForm.hidden = true;
  checkoutSuccess.hidden = false;
  checkoutError.hidden = serverReachable;

  cart = [];
  renderCart();
});

closeSuccessBtn.addEventListener('click', closeCheckoutModal);

// ---------- Init ----------
renderCart();
