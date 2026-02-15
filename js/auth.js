// Cek token dari URL setelah redirect OAuth
const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get('token');
const roleFromUrl = params.get('role');

if (tokenFromUrl) {
  localStorage.setItem('token', tokenFromUrl);
  localStorage.setItem('role', roleFromUrl);
  // Bersihkan URL
  window.history.replaceState({}, '', window.location.pathname);
}

function requireLogin() {
  if (!localStorage.getItem('token')) {
    window.location.href = '/index.html';
  }
}

function requireRole(minRole) {
  const role = localStorage.getItem('role');
  const hierarchy = { viewer: 0, admin: 1, owner: 2 };
  if (hierarchy[role] < hierarchy[minRole]) {
    alert('Akses ditolak. Anda tidak memiliki izin untuk halaman ini.');
    window.location.href = '/dashboard.html';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = '/index.html';
}
