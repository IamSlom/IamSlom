const stripe = Stripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');
const elements = stripe.elements();

const cardStyle = {
  base: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    iconColor: '#FFFFFF',
    '::placeholder': {
      color: '#888888'
    },
    fontSize: '16px'
  },
  hover: {
    backgroundColor: '#444444'
  },
  focus: {

  },
  invalid: {
    color: '#FFC7EE',
    iconColor: '#FFC7EE'
  }
};

const card = elements.create('card', {style: cardStyle, hidePostalCode: true});
card.mount('#card-element');

function getPurchasePrice() {
    const presetPriceElement = document.querySelector('input[name="product_price_preset"]:checked');
    if (presetPriceElement) {
        const price = parseFloat(presetPriceElement.value);
        if (price > 0) return price.toString();
    }

    const customPriceElement = document.getElementById('custom-price');
    if (customPriceElement && customPriceElement.value) {
        const price = parseFloat(customPriceElement.value);
        if (price > 0) return price.toString();
    }
    return '0.01'; // Default or error value
}

const stripeButton = document.querySelector('#stripe-payment-form button');
if (stripeButton) {
    stripeButton.addEventListener('click', function(event) {
        event.preventDefault();
        const price = getPurchasePrice();
        console.log('Stripe purchase price:', price);
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
            const purchasePrice = getPurchasePrice();
            console.log('PayPal purchase price:', purchasePrice);
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: purchasePrice
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                console.log('Transaction completed by ' + details.payer.name.given_name);
                console.log('Purchase details:', details);
            });
        }
    }).render('#paypal-button-container');
}
