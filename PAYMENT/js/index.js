const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
const elements = stripe.elements();
const  style = {
    base: {
        color: '#32325d',
    }
};
const card = elements.create('card', { style: style });
card.mount('#card-element');

card.addEventListener('change', ({error}) => {
    const displayError = document.getElementById('card-errors');
    if (error) {
        displayError.textContent = error.message;
    } else {
        displayError.textContent = '';
    }
});


const form = document.getElementById('payment-form');

form.addEventListener('submit', async e => {
    e.preventDefault();
    let status = document.querySelector('#status');
    let amount = document.querySelector('#amount').value;

    status.style.display = 'none';

    if(!isNaN(Number(amount))) {
        try {
            const data = { amount };
            const resp = await fetch('/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const { clientSecret } = await resp.json();
            stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: card
                }
            }).then(result => {
                if (result.error) {

                    status.innerText = result.error.message;
                    status.classList.add('alert-danger');
                    status.style.display = 'block';
                } else {

                    if (result.paymentIntent.status === 'succeeded') {
                        status.innerText = 'Transaction was successfull.';
                        status.classList.add('alert-success');
                        status.style.display = 'block';
                    } else {

                        status.innerText = result.paymentIntent.status;
                        status.classList.add('alert-danger');
                        status.style.display = 'block';
                    }
                }
            });
        } catch(err) {
            console.log(err);
        }
    }
});