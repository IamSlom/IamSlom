const stripe = Stripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');
const elements = stripe.elements();
const style = {};
const card = elements.create('card', {style: style});
card.mount('#card-element');

const stripeButton = document.querySelector('#stripe-payment-form button');
if (stripeButton) {
    stripeButton.addEventListener('click', function(event) {
        event.preventDefault();
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
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '0.01'
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                console.log('Transaction completed by ' + details.payer.name.given_name);
            });
        }
    }).render('#paypal-button-container');
}
