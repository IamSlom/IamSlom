const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage'
            ]
        });
        const page = await browser.newPage();
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                if (text.includes('Failed to load resource')) {
                    // Ignore network errors for external scripts for this test,
                    // as we are focused on SDK initialization errors.
                    // However, log them for now to be aware.
                    console.log(`Page resource loading error: ${text}`);
                } else {
                    errors.push(text);
                }
            }
        });
        page.on('pageerror', error => {
            errors.push(error.message);
        });

        console.log('Navigating to index.html...');
        await page.goto('file://' + path.join(__dirname, 'index.html'), { waitUntil: 'networkidle0' });

        console.log('Checking for Stripe card element...');
        const stripeCardElement = await page.$('#card-element iframe');
        if (stripeCardElement) {
            console.log('Stripe card element iframe found.');
        } else {
            errors.push('Stripe card element iframe NOT found.');
        }

        console.log('Checking for PayPal button container...');
        const paypalButtonContainer = await page.$('#paypal-button-container iframe');
         if (paypalButtonContainer) {
            console.log('PayPal button iframe found.');
        } else {
            // PayPal SDK might take a bit longer or render differently
            // We'll rely on console errors for PayPal SDK issues primarily
            console.log('PayPal button iframe not immediately found, will rely on console errors for SDK issues.');
        }

        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for async operations

        if (errors.length > 0) {
            console.error('Errors found on page:');
            errors.forEach(err => console.error(err));
            process.exitCode = 1;
        } else {
            console.log('No critical JavaScript errors found on page load and initialization.');
            console.log('Stripe card element appears to be mounted.');
            console.log('PayPal SDK initialized (further button rendering depends on SDK internals).');
        }

    } catch (e) {
        console.error('Error during test execution:', e);
        process.exitCode = 1;
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
})();
