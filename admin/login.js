document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('customer_login');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent the default form submission

            const email = document.getElementById('CustomerEmail').value;
            const password = document.getElementById('CustomerPassword').value;

            // --- Simple hardcoded credentials check ---
            const validEmail = 'devyanshurathore219@gmail.com';
            const validPassword = '123123123';

            if (email === validEmail && password === validPassword) {
                // On success, redirect to the admin dashboard
                window.location.href = 'dashboard.html';
            } else {
                // On failure, show an error message
                showAlert('Invalid email or password', 'error');
            }
        });
    }

    function showAlert(message, type) {
        const alertDiv = document.getElementById('login-alert');
        if (alertDiv) {
            alertDiv.className = 'alert ' + type;
            alertDiv.textContent = message;
            alertDiv.style.display = 'block';
        }
    }
});