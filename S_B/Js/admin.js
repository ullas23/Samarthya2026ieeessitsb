/**
 * Js/admin.js — Admin Dashboard Controller
 * ──────────────────────────────────────────
 * Handles:
 *   1. Admin login (POST /api/admin-login)
 *   2. Fetching registrations (GET /api/admin-registrations)
 *   3. Search & filter UI
 *   4. Token persistence in sessionStorage
 */

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────
  const API_BASE = '';
  const TOKEN_KEY = 'sam26_admin_token';

  // ── DOM References ──────────────────────────────────────
  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const loginPassword = document.getElementById('login-password');
  const loginSubmit = document.getElementById('login-submit');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  const dashSearch = document.getElementById('dash-search');
  const dashEventFilter = document.getElementById('dash-event-filter');
  const dashCount = document.getElementById('dash-count');
  const dashLoading = document.getElementById('dash-loading');
  const dashTable = document.getElementById('dash-table');
  const dashTbody = document.getElementById('dash-tbody');
  const dashEmpty = document.getElementById('dash-empty');

  // ── State ───────────────────────────────────────────────
  let allRegistrations = [];

  // ── Token helpers ───────────────────────────────────────
  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  function setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  // ── UI State ────────────────────────────────────────────
  function showLogin() {
    loginScreen.style.display = '';
    dashboard.classList.remove('active');
    logoutBtn.style.display = 'none';
  }
  function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.classList.add('active');
    logoutBtn.style.display = '';
  }

  // ── Login ───────────────────────────────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    loginSubmit.disabled = true;
    loginSubmit.textContent = 'Authenticating…';

    const password = loginPassword.value.trim();
    if (!password) {
      loginError.textContent = 'Please enter the admin password';
      loginError.style.display = 'block';
      loginSubmit.disabled = false;
      loginSubmit.textContent = 'Authenticate';
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await resp.json();

      if (result.success && result.data && result.data.token) {
        setToken(result.data.token);
        showDashboard();
        loadRegistrations();
      } else {
        loginError.textContent = result.error?.details?.[0] || result.message || 'Login failed';
        loginError.style.display = 'block';
      }
    } catch (err) {
      loginError.textContent = 'Network error. Please check your connection.';
      loginError.style.display = 'block';
    }

    loginSubmit.disabled = false;
    loginSubmit.textContent = 'Authenticate';
  });

  // ── Logout ──────────────────────────────────────────────
  logoutBtn.addEventListener('click', () => {
    clearToken();
    showLogin();
    loginPassword.value = '';
    allRegistrations = [];
    dashTbody.innerHTML = '';
  });

  // ── Load Registrations ──────────────────────────────────
  async function loadRegistrations() {
    const token = getToken();
    if (!token) {
      showLogin();
      return;
    }

    dashLoading.style.display = '';
    dashTable.style.display = 'none';
    dashEmpty.style.display = 'none';

    try {
      const resp = await fetch(`${API_BASE}/api/admin-registrations`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (resp.status === 401) {
        clearToken();
        showLogin();
        return;
      }

      const result = await resp.json();

      if (result.success && result.data) {
        allRegistrations = result.data.registrations || [];
        populateEventFilter();
        renderTable();
      } else {
        dashLoading.innerHTML = '<div style="color:#ff6b6b;">Failed to load registrations</div>';
      }
    } catch (err) {
      dashLoading.innerHTML = '<div style="color:#ff6b6b;">Network error. Please retry.</div>';
    }
  }

  // ── Populate Event Filter ───────────────────────────────
  function populateEventFilter() {
    const eventSet = new Set();
    allRegistrations.forEach((r) => {
      if (r.eventId) eventSet.add(r.eventId + '::' + (r.eventName || r.eventId));
    });

    // Clear existing options (keep "All Events")
    dashEventFilter.innerHTML = '<option value="">All Events</option>';
    Array.from(eventSet)
      .sort()
      .forEach((key) => {
        const [id, name] = key.split('::');
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = `${name} (${id})`;
        dashEventFilter.appendChild(opt);
      });
  }

  // ── Render Table ────────────────────────────────────────
  function renderTable() {
    const searchQuery = (dashSearch.value || '').trim().toLowerCase();
    const eventFilter = dashEventFilter.value;

    let filtered = allRegistrations;

    // Apply event filter
    if (eventFilter) {
      filtered = filtered.filter((r) => r.eventId === eventFilter);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter((r) => {
        const haystack = [
          r.participantName,
          r.email,
          r.usn,
          r.teamName,
          r.college,
          r.eventName,
          r.eventId,
          r.phone,
        ].join(' ').toLowerCase();
        return haystack.includes(searchQuery);
      });
    }

    dashLoading.style.display = 'none';

    if (filtered.length === 0) {
      dashTable.style.display = 'none';
      dashEmpty.style.display = '';
      dashCount.textContent = '0 registrations';
      return;
    }

    dashTable.style.display = '';
    dashEmpty.style.display = 'none';
    dashCount.textContent = `${filtered.length} registration${filtered.length !== 1 ? 's' : ''}`;

    dashTbody.innerHTML = '';
    filtered.forEach((r, i) => {
      const tr = document.createElement('tr');

      // Status class
      const statusClass = (r.status || '').toLowerCase().includes('confirmed')
        ? 'confirmed'
        : 'pending';

      // Format timestamp
      let timeStr = '';
      if (r.timestamp) {
        try {
          const d = new Date(r.timestamp);
          timeStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
          timeStr = r.timestamp;
        }
      }

      // Team info
      let teamInfo = r.teamName || '—';
      if (r.teamSize && parseInt(r.teamSize) > 1) {
        teamInfo += ` (${r.teamSize})`;
      }

      tr.innerHTML = `
        <td style="color:rgba(232,244,248,0.3);font-size:0.75rem;">${i + 1}</td>
        <td><span class="dash-time">${escapeHtml(timeStr)}</span></td>
        <td><span class="dash-event-badge">${escapeHtml(r.eventId)}</span><br>
            <span style="font-size:0.75rem;color:rgba(232,244,248,0.5);">${escapeHtml(r.eventName)}</span></td>
        <td>${escapeHtml(r.participantName)}</td>
        <td><span style="font-family:'Share Tech Mono',monospace;font-size:0.75rem;">${escapeHtml(r.usn)}</span></td>
        <td style="font-size:0.8rem;word-break:break-all;">${escapeHtml(r.email)}</td>
        <td style="font-size:0.8rem;">${escapeHtml(r.phone)}</td>
        <td style="font-size:0.8rem;">${escapeHtml(r.college)}</td>
        <td style="font-size:0.8rem;">${escapeHtml(teamInfo)}</td>
        <td><span class="dash-status ${statusClass}">${escapeHtml(r.status || 'N/A')}</span></td>
      `;
      dashTbody.appendChild(tr);
    });
  }

  // ── Search & Filter Listeners ───────────────────────────
  let searchTimeout = null;
  dashSearch.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(renderTable, 300);
  });
  dashEventFilter.addEventListener('change', renderTable);

  // ── HTML escaping utility ───────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Auto-login if token exists ──────────────────────────
  if (getToken()) {
    showDashboard();
    loadRegistrations();
  } else {
    showLogin();
  }
})();
