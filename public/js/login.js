const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginSubmit = document.getElementById('loginSubmit');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  loginError.hidden = true;
  loginSubmit.disabled = true;
  loginSubmit.textContent = 'Logging in…';

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Login failed.');
    }

    window.location.href = 'admin.html';
  } catch (err) {
    loginError.textContent = err.message || "Couldn't log in. Try again.";
    loginError.hidden = false;
    loginSubmit.disabled = false;
    loginSubmit.textContent = 'Log in';
  }
});
