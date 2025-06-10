# Backend Requirements for Payment Processing

This document outlines the backend server requirements necessary to support the payment processing functionalities of the donation page and admin panel.

## General Backend Responsibilities

A robust backend is crucial for secure and reliable payment processing. Key responsibilities include:

1.  **Secure API Key Management:**
    *   Store all secret API keys (e.g., Stripe Secret Key, PayPal Client Secret, Crypto Gateway API keys) securely. These keys should never be exposed client-side.
    *   Use environment variables or a secure vault system for key storage.

2.  **Handle Payment Intents/Orders:**
    *   Manage the lifecycle of payments (creation, confirmation, processing, and recording status).
    *   Interact with the respective payment provider APIs.

3.  **Provide Endpoints for Frontend Communication:**
    *   Expose secure API endpoints for the client-side application to:
        *   Initiate payments (e.g., create PaymentIntents for Stripe, create Orders for PayPal).
        *   Potentially retrieve payment status or history (for user-facing elements, if any).

4.  **Implement Webhooks for Asynchronous Updates:**
    *   Set up webhook endpoints to receive real-time notifications from payment providers about payment events (e.g., successful payments, failures, disputes, refunds).
    *   This is essential for reliable order fulfillment and status tracking, as client-side confirmation alone is not sufficient.

5.  **Store Transaction Records:**
    *   Maintain a database to store details of all transactions, including donation amount, currency, payment method, status, timestamps, and any relevant IDs from payment providers.
    *   This data is vital for record-keeping, reconciliation, and the payment logs feature in the admin panel.

6.  **Admin Panel Support:**
    *   Endpoints for the admin panel to:
        *   Securely update and manage API keys (requires strong authentication and authorization).
        *   Fetch and display payment logs from the transaction database.

## Stripe Specifics

Backend integration for Stripe involves:

1.  **Endpoint to Create a PaymentIntent:**
    *   **Route (Example):** `POST /create-stripe-payment-intent`
    *   **Input:**
        *   `amount`: The donation amount (integer, in the smallest currency unit, e.g., cents).
        *   `currency`: The currency code (e.g., "usd").
    *   **Action:**
        *   Authenticates the request (if applicable).
        *   Calls the Stripe API (`stripe.paymentIntents.create()`) with the amount, currency, and potentially other parameters like `automatic_payment_methods: {enabled: true}`.
    *   **Output:**
        *   `client_secret`: The client secret of the created PaymentIntent. This is sent to the frontend to confirm the payment.

2.  **Webhook Endpoint for Stripe Events:**
    *   **Route (Example):** `POST /stripe-webhook`
    *   **Action:**
        *   Receives events from Stripe.
        *   **Crucially, verifies the webhook signature** using your Stripe webhook signing secret to ensure the request is genuinely from Stripe.
        *   Parses the event data.
        *   Handles relevant event types, such as:
            *   `payment_intent.succeeded`: Update the transaction status in your database to "completed," record relevant details.
            *   `payment_intent.payment_failed`: Update the transaction status to "failed," log error details.
            *   Other events as needed (e.g., `charge.refunded`).
        *   Returns a `200 OK` response to Stripe quickly to acknowledge receipt. Complex business logic should be handled asynchronously.

## PayPal Specifics

Backend integration for PayPal (using Orders V2 API):

1.  **Endpoint to Create a PayPal Order:**
    *   **Route (Example):** `POST /create-paypal-order`
    *   **Input:**
        *   `amount`: The donation amount (string, e.g., "10.00").
        *   `currency`: The currency code (e.g., "USD").
    *   **Action:**
        *   Calls the PayPal Orders API to create an order with the specified amount and currency. The `intent` should typically be `CAPTURE`.
    *   **Output:**
        *   `order_id`: The ID of the created PayPal order. This is sent to the frontend for the PayPal SDK to use.

2.  **Endpoint to Capture a PayPal Order:**
    *   **Route (Example):** `POST /capture-paypal-order`
    *   **Input:**
        *   `order_id`: The ID of the PayPal order to capture, obtained after the user approves the payment on the client side.
    *   **Action:**
        *   Calls the PayPal Orders API to capture the payment for the given `order_id`.
    *   **Output:**
        *   Success/failure status, potentially with transaction details. Update your database accordingly.

3.  **Webhook Endpoint for PayPal Events:**
    *   **Route (Example):** `POST /paypal-webhook`
    *   **Action:**
        *   Receives webhook events from PayPal.
        *   **Verifies the webhook signature** using your PayPal webhook ID and the appropriate cryptographic methods outlined in PayPal documentation.
        *   Handles relevant event types, such as:
            *   `CHECKOUT.ORDER.APPROVED`: The user has approved the order. You might capture it here if not already done via the capture endpoint.
            *   `CHECKOUT.ORDER.COMPLETED`: The payment is completed (often used if `intent:CAPTURE` was set and capture happened automatically or was explicitly called). Update transaction status in your database.
        *   Returns a `200 OK` response to PayPal.

## Cryptocurrency Gateways (General Guidance)

Integrating cryptocurrency payments varies widely depending on the chosen gateway (e.g., Coinbase Commerce, BitPay, BTCPay Server). However, common backend patterns include:

1.  **Initiate Crypto Payment Endpoint:**
    *   **Route (Example):** `POST /initiate-crypto-payment`
    *   **Input:** `amount`, `currency` (may be converted to crypto equivalent by backend or gateway).
    *   **Action:** Interacts with the crypto gateway's API to create a charge or invoice.
    *   **Output:** Could be a payment address, a QR code URL, a redirect URL to the gateway's payment page, or an invoice ID.

2.  **Webhook for Payment Confirmation:**
    *   Most gateways provide a webhook mechanism to notify your server about payment status (e.g., payment pending, confirmed, failed).
    *   **Route (Example):** `POST /crypto-webhook` (specific URL provided by gateway).
    *   **Action:**
        *   Verify the webhook's authenticity (method varies by gateway).
        *   Update transaction status in your database upon confirmation.

*Users must consult their chosen crypto payment gateway's official developer documentation for specific API endpoints, request/response formats, and webhook setup.*

## Cash App Pay (General Guidance)

Integrating Cash App Pay also requires server-side components as per their API documentation.

1.  **Endpoints for Payment Management:**
    *   Likely involves an endpoint to create a payment request or customer order, providing amount and currency.
    *   The Cash App Pay API will dictate the exact flow, which might involve redirecting the user or using a client-side SDK driven by server-generated parameters.

2.  **Webhooks for Status Updates:**
    *   Cash App Pay will use webhooks to inform your server about the status of payments (e.g., created, authorized, captured, failed).
    *   **Route (Example):** `POST /cashapp-webhook`
    *   **Action:**
        *   Verify webhook integrity.
        *   Update transaction records based on the event.

*Users must consult the official Cash App Pay developer documentation for detailed server-side integration instructions.*

---

By implementing these backend components, you can create a secure, reliable, and full-featured payment processing system for the donation platform. Remember to prioritize security, especially around API key management and webhook verification.
