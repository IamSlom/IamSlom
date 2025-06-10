const stripe = Stripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');
const elements = stripe.elements();
const style = {};
const card = elements.create('card', {style: style});
card.mount('#card-element');

function getDonationAmount() {
    const presetAmountElement = document.querySelector('input[name="donation_amount_preset"]:checked');
    if (presetAmountElement) {
        const amount = parseFloat(presetAmountElement.value);
        if (amount > 0) return amount.toString();
    }

    const customAmountElement = document.getElementById('custom-amount');
    if (customAmountElement && customAmountElement.value) {
        const amount = parseFloat(customAmountElement.value);
        if (amount > 0) return amount.toString();
    }
    return '0.01'; // Default or error value
}

const stripeButton = document.querySelector('#stripe-payment-form button');
if (stripeButton) {
    stripeButton.addEventListener('click', function(event) {
        event.preventDefault();
        const amount = getDonationAmount();
        console.log('Stripe donation amount:', amount);
        stripe.createToken(card).then(function(result) {
            if (result.error) {
                console.error(result.error.message);
            } else {
                console.log(result.token.id);
            }
        });
    });
}

if (document.getElementById('paypal-button-container')) {
    paypal.Buttons({
        createOrder: function(data, actions) {
            const donationAmount = getDonationAmount();
            console.log('PayPal donation amount:', donationAmount);
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: donationAmount
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                console.log('Transaction completed by ' + details.payer.name.given_name);
                console.log('Donation details:', details);
            });
        }
    }).render('#paypal-button-container');
}
