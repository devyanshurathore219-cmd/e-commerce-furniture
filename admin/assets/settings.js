/* ============================================================
   Admin — Settings (Profile, Change Password, Logout)
   ============================================================ */
(function() {
    'use strict';

    var API = window.Admin.API_BASE;

    function init() {
        var user = window.Admin.getUser();
        document.getElementById('displayName').textContent = user;
        document.getElementById('displayEmail').textContent = user; // Using name as identifier; replace with email if stored

        bindEvents();
    }

    function bindEvents() {
        var form = document.getElementById('changePasswordForm');
        var btnLogout = document.getElementById('btnLogout');

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                changePassword();
            });
        }

        if (btnLogout) {
            btnLogout.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    window.Admin.logout();
                }
            });
        }
    }

    function changePassword() {
        var current = document.getElementById('currentPassword').value;
        var newPass = document.getElementById('newPassword').value;
        var confirmPass = document.getElementById('confirmPassword').value;

        if (!current || !newPass || !confirmPass) {
            window.Admin.showToast('All fields are required', 'warning');
            return;
        }

        if (newPass !== confirmPass) {
            window.Admin.showToast('New passwords do not match', 'warning');
            return;
        }

        if (newPass.length < 6) {
            window.Admin.showToast('Password must be at least 6 characters', 'warning');
            return;
        }

        // The backend doesn't have a change-password endpoint in the existing routes,
        // so we call login again to verify current password, then update.
        // For now, just show success feedback since there's no change-password API.
        window.Admin.showToast('Password change is not yet implemented in backend', 'warning');
    }

    window.AdminSettings = { init: init };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();