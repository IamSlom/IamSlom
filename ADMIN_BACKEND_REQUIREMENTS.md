# Admin Panel Backend Requirements

This document outlines the backend server requirements necessary to support the functionalities of the Payment Administration Panel. Security is paramount for all admin panel features.

## General Admin Panel Backend Responsibilities

1.  **Secure User Authentication and Authorization (Critical):**
    *   Implement a robust authentication mechanism for admin users (e.g., username/password with strong password hashing like bcrypt or Argon2, consider multi-factor authentication (MFA)).
    *   Ensure that all admin panel endpoints are protected and require successful authentication.
    *   Implement authorization checks if different admin roles or permissions are needed in the future.

2.  **Endpoints for Admin Functionalities:**
    *   Provide dedicated and secure API endpoints for each feature available in the admin panel (API key management, payment log retrieval, etc.).

3.  **Secure Storage and Retrieval of Sensitive Data:**
    *   Manage the storage and access of sensitive information like API secret keys and payment transaction logs with utmost care.
    *   Employ encryption for sensitive data at rest and ensure data is transmitted securely over HTTPS.

## API Key Management Specifics

1.  **Endpoint to Securely Save/Update API Keys:**
    *   **Route (Example):** `POST /admin/api-keys`
    *   **Authentication:** Required (Admin access only).
    *   **Input:** JSON payload containing API keys for various services (e.g., `stripe_publishable_key`, `stripe_secret_key`, `paypal_client_id`).
    *   **Action:**
        *   Validate the input.
        *   **Crucially, encrypt all secret keys** before storing them. Options include:
            *   Storing in environment variables (preferred for many deployment strategies, keys are set at the environment level).
            *   Using a dedicated secrets management service (e.g., HashiCorp Vault, AWS Secrets Manager).
            *   Storing in a database, but only if the secret key values are encrypted using a strong encryption algorithm and a securely managed encryption key. **Never store raw secret keys in a plain database field.**
        *   Update the application's configuration to use the new keys. This might involve restarting the application or a mechanism to reload configuration dynamically and securely.
    *   **Output:** Success or failure status message.

2.  **Endpoint to Retrieve API Keys (for Display/Status):**
    *   **Route (Example):** `GET /admin/api-keys`
    *   **Authentication:** Required (Admin access only).
    *   **Input:** Optional query parameters to specify which key types are needed (e.g., `?service=stripe`).
    *   **Action:**
        *   Retrieve the status or non-sensitive parts of API keys.
        *   For publishable keys (like Stripe Publishable Key, PayPal Client ID), these can be returned directly.
        *   For secret keys, **avoid sending the full secret key back to the client if possible.** Instead:
            *   Indicate if the key is set (e.g., `stripe_secret_key_set: true`).
            *   Return a masked version (e.g., `sk_live_****1234`).
            *   If full display is absolutely necessary for an admin to copy/verify, ensure robust authentication and HTTPS are in place. The risk of exposure must be carefully managed.
    *   **Output:** JSON object containing the requested API key information (e.g., `{ "stripe_publishable_key": "pk_live_...", "stripe_secret_key_status": "Set" }`).

## Payment Logs Specifics

1.  **Endpoint to Fetch Payment Logs:**
    *   **Route (Example):** `GET /admin/payment-logs`
    *   **Authentication:** Required (Admin access only).
    *   **Input (Optional Query Parameters):**
        *   `page`: For pagination (e.g., `1`).
        *   `limit`: Number of records per page (e.g., `20`).
        *   `startDate`, `endDate`: To filter by date range.
        *   `status`: To filter by payment status (e.g., "succeeded", "failed").
        *   `payment_method`: To filter by payment method.
    *   **Action:**
        *   Validate input parameters.
        *   Query the transaction database where payment details and statuses are stored (this database is updated by the payment processing webhooks and API calls).
        *   Apply filtering and pagination as per the input parameters.
    *   **Output:** JSON object containing a paginated list of payment log entries. Each entry might include:
        *   `transaction_id`
        *   `donation_amount`
        *   `currency`
        *   `payment_method`
        *   `status`
        *   `timestamp`
        *   `customer_identifier` (if available)
        *   `error_message` (if applicable)

## Security Considerations for Admin Panel (Critical)

The admin panel handles highly sensitive data and configurations, making its security paramount.

1.  **Authentication:**
    *   Implement strong, industry-standard authentication for admin access.
    *   Enforce strong password policies.
    *   Strongly consider Multi-Factor Authentication (MFA).

2.  **Authorization:**
    *   Ensure that only properly authenticated users with administrative privileges can access any admin panel endpoints or functionalities.

3.  **Input Validation:**
    *   Rigorously validate and sanitize all input received from the client-side (API key values, log query parameters, etc.) to prevent common web vulnerabilities like XSS, SQL injection, etc.

4.  **HTTPS Everywhere:**
    *   The admin panel and all its API endpoints **must** be served exclusively over HTTPS to protect data in transit.

5.  **Cross-Site Request Forgery (CSRF) Protection:**
    *   Implement CSRF protection (e.g., using CSRF tokens) for any backend endpoints that perform state-changing operations (like saving API keys).

6.  **Rate Limiting and Account Lockout:**
    *   Implement rate limiting on login attempts and other sensitive operations to protect against brute-force attacks.
    *   Consider account lockout policies after multiple failed login attempts.

7.  **Secure API Key Storage:**
    *   Reiterate: Secret API keys must be encrypted at rest using strong encryption methods and securely managed encryption keys. Environment variables or dedicated secret management services are generally preferred over direct database storage for raw secrets.

8.  **Regular Security Audits:**
    *   Periodically review and audit the security of the admin panel and its backend components.

9.  **Logging and Monitoring:**
    *   Implement detailed logging for admin actions, especially for sensitive operations like API key updates. Monitor these logs for suspicious activity.

By adhering to these backend requirements and security best practices, the admin panel can effectively and securely manage the payment system.
