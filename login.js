document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('admin-login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessageDiv = document.getElementById('login-error-message');

    if (loginForm && usernameInput && passwordInput && errorMessageDiv) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            errorMessageDiv.textContent = '';

            if (username === '' || password === '') {
                errorMessageDiv.textContent = 'Username and password are required.';
                return;
            }

            console.log('Username:', username);
            console.log('Password:', password);
            console.log('TODO: Implement backend authentication call to verify credentials.');

            // Simulate backend call
            // For this simulation, let's assume a "correct" username/password is "admin"/"password"
            // In a real application, this check MUST be done on the backend.
            if (username === 'admin' && password === 'password') {
                console.log('Login successful (simulated). Redirecting to admin.html...');
                // Simulate a short delay before redirecting to make the console log visible
                setTimeout(function() {
                    window.location.href = 'admin.html';
                }, 500);
            } else {
                console.log('Login failed (simulated).');
                errorMessageDiv.textContent = 'Invalid username or password (simulated).';
            }
        });
    } else {
        console.error('Login form elements not found. Check IDs in login.html and login.js.');
    }
});
