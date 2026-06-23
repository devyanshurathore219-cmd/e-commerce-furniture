/* ============================================================
   Admin Dashboard — Shared utilities, auth guard, sidebar, toast
   ============================================================ */

var Admin = (function() {
    'use strict';

    var API_BASE = 'http://localhost:5000/api';

    // ================================================================
    // Auth Guard
    // ================================================================
    function checkAuth() {
        var token = localStorage.getItem('adminToken');
        var user = localStorage.getItem('adminUser');
        if (!token || !user) {
            window.location.href = 'login.html';
            return null;
        }
        return { token: token, user: user };
    }

    function login(email, password) {
        return fetch(API_BASE + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        }).then(function(res) {
            if (!res.ok) {
                return res.json().then(function(data) {
                    throw new Error(data.message || 'Login failed');
                });
            }
            return res.json();
        }).then(function(data) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', data.user);
            return data;
        });
    }

    function logout() {
        localStorage.clear();
        window.location.href = 'login.html';
    }

    function getUser() {
        return localStorage.getItem('adminUser') || 'Admin';
    }

    // ================================================================
    // Sidebar Toggle
    // ================================================================
    function initSidebar() {
        var toggleBtn = document.getElementById('sidebarToggle');
        var sidebar = document.getElementById('sidebar');
        var overlay = document.getElementById('sidebarOverlay');

        if (!toggleBtn || !sidebar) return;

        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('open');
        });

        if (overlay) {
            overlay.addEventListener('click', function() {
                sidebar.classList.remove('open');
                overlay.classList.remove('open');
            });
        }
    }

    // ================================================================
    // Toast Notifications
    // ================================================================
    function ensureToastContainer() {
        var container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    function showToast(message, type) {
        type = type || 'success';
        var container = ensureToastContainer();

        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.textContent = message;

        var icons = {
            success: '✓',
            error: '✕',
            warning: '⚠'
        };
        toast.textContent = (icons[type] || '') + ' ' + message;

        container.appendChild(toast);

        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(function() {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // ================================================================
    // API Helper
    // ================================================================
    function apiFetch(url, options) {
        options = options || {};
        options.headers = options.headers || {};
        return fetch(url, options).then(function(res) {
            if (!res.ok) {
                return res.json().then(function(data) {
                    throw new Error(data.error || data.message || 'Request failed');
                });
            }
            return res.json();
        });
    }

    // ================================================================
    // Escape HTML
    // ================================================================
    function escapeHtml(text) {
        if (!text && text !== 0) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ================================================================
    // Format Date
    // ================================================================
    function formatDate(dateStr) {
        if (!dateStr) return '-';
        var d = new Date(dateStr);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // ================================================================
    // Populate sidebar user name
    // ================================================================
    function initUserDisplay() {
        var el = document.getElementById('sidebarUser');
        if (el) el.textContent = getUser();
    }

    // ================================================================
    // Init (runs on every admin page)
    // ================================================================
    function init() {
        checkAuth();
        initSidebar();
        initUserDisplay();

        // Set active nav link
        var currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('.sidebar-nav a').forEach(function(link) {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        API_BASE: API_BASE,
        checkAuth: checkAuth,
        login: login,
        logout: logout,
        getUser: getUser,
        showToast: showToast,
        fetch: apiFetch,
        escapeHtml: escapeHtml,
        formatDate: formatDate
    };

})();