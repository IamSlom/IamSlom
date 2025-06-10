document.addEventListener('DOMContentLoaded', function() {
    const apiKeyForm = document.getElementById('api-key-form');
    const stripePublishableKeyInput = document.getElementById('stripe-publishable-key');
    const stripeSecretKeyInput = document.getElementById('stripe-secret-key');
    const paypalClientIdInput = document.getElementById('paypal-client-id');
    const cryptoApiKeyInput = document.getElementById('crypto-api-key');
    const cashAppApiKeyInput = document.getElementById('cash-app-api-key');

    if (apiKeyForm) {
        apiKeyForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const stripePublishableKey = stripePublishableKeyInput ? stripePublishableKeyInput.value : null;
            const stripeSecretKey = stripeSecretKeyInput ? stripeSecretKeyInput.value : null;
            const paypalClientId = paypalClientIdInput ? paypalClientIdInput.value : null;
            const cryptoApiKey = cryptoApiKeyInput ? cryptoApiKeyInput.value : null;
            const cashAppApiKey = cashAppApiKeyInput ? cashAppApiKeyInput.value : null;

            console.log('Stripe Publishable Key:', stripePublishableKey);
            console.log('Stripe Secret Key:', stripeSecretKey);
            console.log('PayPal Client ID:', paypalClientId);
            console.log('Crypto API Key:', cryptoApiKey);
            console.log('Cash App API Key:', cashAppApiKey);
            console.log('TODO: Implement backend call to securely save API keys.');
            if (stripeSecretKeyInput) {
                 stripeSecretKeyInput.value = '';
            }
        });
    }

    const refreshLogsButton = document.getElementById('refresh-logs-button');
    const logsDisplay = document.getElementById('logs-display');

    if (refreshLogsButton && logsDisplay) {
        refreshLogsButton.addEventListener('click', function() {
            logsDisplay.textContent = 'Fetching logs...';
            console.log('TODO: Implement backend call to fetch payment logs.');
            setTimeout(function() {
                if (logsDisplay.textContent === 'Fetching logs...') {
                    logsDisplay.textContent = 'Log fetching simulated. No actual backend call made.';
                }
            }, 2000);
        });
    }
});
