# Comprehensive Backend Requirements

This document outlines the backend server requirements necessary to support both the product purchase processing and the Payment Administration Panel functionalities.

## I. Backend Requirements for Product Purchase Processing

This section details the backend components required to handle the "set your own price" product purchase model.

### General Backend Responsibilities

1.  **Secure API Key Management:**
    *   Store all secret API keys (e.g., Stripe Secret Key, PayPal Client Secret, Crypto Gateway API keys) securely. These keys should never be exposed client-side.
    *   Use environment variables or a secure vault system for key storage.

2.  **Handle Product Orders/Payments:**
    *   Manage the lifecycle of product purchases (creation of payment intent/order, confirmation, processing, and recording status).
    *   Interact with the respective payment provider APIs using the user-defined product price.

3.  **Provide Endpoints for Frontend Communication:**
    *   Expose secure API endpoints for the client-side application to:
        *   Initiate payments (e.g., create PaymentIntents for Stripe, create Orders for PayPal) using the determined product price.

4.  **Implement Webhooks for Asynchronous Updates:**
    *   Set up webhook endpoints to receive real-time notifications from payment providers about payment events (e.g., successful payments, failures, disputes, refunds).
    *   This is essential for reliable order fulfillment and status tracking.

5.  **Store Transaction/Order Records:**
    *   Maintain a database to store details of all product purchases, including the determined price, currency, payment method, status, timestamps, and any relevant IDs from payment providers.
    *   This data is vital for record-keeping, reconciliation, and the payment logs feature in the admin panel.

### Stripe Specifics

Backend integration for Stripe involves:

1.  **Endpoint to Create a PaymentIntent:**
    *   **Route (Example):** `POST /create-stripe-payment-intent`
    *   **Input:**
        *   `amount`: The product price (integer, in the smallest currency unit, e.g., cents).
        *   `currency`: The currency code (e.g., "usd").
    *   **Action:**
        *   Calls the Stripe API (`stripe.paymentIntents.create()`) with the amount, currency. Consider adding `automatic_payment_methods: {enabled: true}`.
    *   **Output:**
        *   `client_secret`: The client secret of the created PaymentIntent.

2.  **Webhook Endpoint for Stripe Events:**
    *   **Route (Example):** `POST /stripe-webhook`
    *   **Action:**
        *   Verifies the webhook signature using your Stripe webhook signing secret.
        *   Handles event types like `payment_intent.succeeded`, `payment_intent.payment_failed`.
        *   Updates order status in the database.
        *   Returns a `200 OK` response to Stripe.

### PayPal Specifics

Backend integration for PayPal (using Orders V2 API):

1.  **Endpoint to Create a PayPal Order:**
    *   **Route (Example):** `POST /create-paypal-order`
    *   **Input:**
        *   `amount`: The product price (string, e.g., "10.00").
        *   `currency`: The currency code (e.g., "USD").
    *   **Action:** Calls the PayPal Orders API to create an order with the product price. `intent` should be `CAPTURE`.
    *   **Output:** `order_id`.

2.  **Endpoint to Capture a PayPal Order:**
    *   **Route (Example):** `POST /capture-paypal-order`
    *   **Input:** `order_id`.
    *   **Action:** Calls the PayPal Orders API to capture the payment.
    *   **Output:** Success/failure status. Update database accordingly.

3.  **Webhook Endpoint for PayPal Events:**
    *   **Route (Example):** `POST /paypal-webhook`
    *   **Action:**
        *   Verifies the webhook signature.
        *   Handles events like `CHECKOUT.ORDER.COMPLETED`.
        *   Updates order status in your database.
        *   Returns a `200 OK` response.

### Cryptocurrency Gateways (General Guidance)

1.  **Initiate Crypto Payment Endpoint:**
    *   **Route (Example):** `POST /initiate-crypto-payment`
    *   **Input:** `amount` (product price), `currency`.
    *   **Action:** Interacts with the gateway's API to create a charge/invoice for the product price.
    *   **Output:** Payment address, QR code URL, redirect URL, or invoice ID.

2.  **Webhook for Payment Confirmation:**
    *   **Route (Example):** `POST /crypto-webhook`
    *   **Action:** Verify webhook, update order status.
    *   *Users must consult their chosen crypto payment gateway's official developer documentation.*

### Cash App Pay (General Guidance)

1.  **Endpoints for Payment Management:**
    *   Endpoint to create a payment request for the product price.
2.  **Webhooks for Status Updates:**
    *   **Route (Example):** `POST /cashapp-webhook`
    *   **Action:** Verify webhook, update order status.
    *   *Users must consult the official Cash App Pay developer documentation.*

---

## II. Backend Requirements for Admin Panel

This section details backend components for the Payment Administration Panel, emphasizing security.

### A. Admin Authentication

Secure authentication is the foundation of admin panel security.

1.  **Login Endpoint:**
    *   **Route (Example):** `POST /admin/login` or `/api/admin/login`
    *   **Input:** `username` (or `email`), `password`.
    *   **Action:**
        *   Validate input (e.g., non-empty).
        *   Retrieve the admin user record based on the username/email.
        *   Securely compare the provided password with the stored hashed password using a constant-time comparison function (e.g., via bcrypt.compare).
        *   If credentials are valid, generate a secure session identifier (e.g., a cryptographically strong session token like a JWT, or initialize a server-side session).
        *   Store session information appropriately (e.g., if JWT, client stores it; if server session, ID stored in a secure, HttpOnly cookie).
    *   **Output:**
        *   On success: Success status, session token (if using token-based auth), user information (excluding sensitive data).
        *   On failure: Error status (e.g., 401 Unauthorized), generic error message.

2.  **Session Management/Middleware:**
    *   All subsequent admin API endpoints must be protected by middleware that verifies the user's session.
    *   For token-based auth (JWT): Middleware extracts the token (e.g., from Authorization header), validates its signature and expiration, and potentially checks against a revocation list.
    *   For cookie-based sessions: Middleware verifies the session ID from the cookie against the server's session store.
    *   If authentication fails or session is invalid/expired, the middleware must reject the request (e.g., respond with 401 Unauthorized or 403 Forbidden).

3.  **Secure Admin User Storage:**
    *   Admin usernames and passwords must be stored securely.
    *   Passwords **must** be hashed using a strong, adaptive hashing algorithm (e.g., bcrypt, scrypt, Argon2). Salt must be unique per user and stored with the hash.
    *   Consider storing other admin user details as needed (e.g., roles, email for password recovery).

4.  **(Optional) Logout Endpoint:**
    *   **Route (Example):** `POST /admin/logout`
    *   **Action:**
        *   For token-based auth: If using a denylist/revocation list for tokens, add the current token to it. Client should also delete the token.
        *   For cookie-based sessions: Destroy the session on the server-side and clear the session cookie on the client-side.
    *   **Output:** Success status.

### B. API Key Management

(Protected by Admin Authentication Middleware)

1.  **Endpoint to Securely Save/Update API Keys:**
    *   **Route (Example):** `POST /admin/api-keys`
    *   **Input:** JSON payload with API keys.
    *   **Action:** Validate input. Encrypt secret keys before storing (environment variables, secrets manager, or encrypted database fields are options).
    *   **Output:** Success/failure status.

2.  **Endpoint to Retrieve API Keys (for Display/Status):**
    *   **Route (Example):** `GET /admin/api-keys`
    *   **Input:** Optional service specifier.
    *   **Action:** Retrieve status (set/not set) or non-sensitive parts (publishable keys, masked secret keys). **Avoid sending full secret keys.**
    *   **Output:** JSON with requested key information.

### C. Payment/Order Logs

(Protected by Admin Authentication Middleware)

1.  **Endpoint to Fetch Payment/Order Logs:**
    *   **Route (Example):** `GET /admin/payment-logs`
    *   **Input (Optional Query Parameters):** `page`, `limit`, `startDate`, `endDate`, `status`, `payment_method`.
    *   **Action:** Validate parameters. Query the transaction/order database.
    *   **Output:** JSON with paginated list of order/transaction entries (ID, price, currency, status, timestamp, etc.).

### D. Security Considerations for Admin Panel (Critical Re-emphasis)

1.  **Authentication:** As detailed in section II.A. Strong, MFA-considered.
2.  **Authorization:** If multiple admin roles are envisioned (e.g., super-admin, log-viewer), implement role-based access control (RBAC) to restrict access to functionalities based on roles.
3.  **Input Validation:** Rigorously validate all inputs on all admin endpoints (types, formats, lengths) to prevent injection, XSS, and other attacks.
4.  **HTTPS Everywhere:** All admin panel interactions (HTML pages and API calls) must be exclusively over HTTPS.
5.  **CSRF Protection:** Implement CSRF tokens for all state-changing operations in the admin panel (e.g., saving API keys, user management if added).
6.  **Rate Limiting:** Apply rate limiting to login endpoint and other sensitive admin API endpoints to mitigate brute-force and denial-of-service attempts.
7.  **Secure API Key Storage:** Reiterate: Secret API keys managed by the admin panel must be encrypted at rest using strong methods.
8.  **Security Headers:** Implement security-enhancing HTTP headers (e.g., Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security).
9.  **Regular Audits & Updates:** Periodically audit admin panel security and keep all dependencies updated.
10. **Activity Logging:** Log significant admin actions (e.g., login attempts, API key changes) for audit trails.

---

By implementing these comprehensive backend components and adhering strictly to security best practices, the platform can support both product purchases and secure administration.
