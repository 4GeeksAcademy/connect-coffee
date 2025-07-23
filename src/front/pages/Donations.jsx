// DonationPage.jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_API_PUBKEY;
//const stripePromise = loadStripe('pk_test_51RnZc1CNbjgT3l1nswYbclIC3Eo8awQ9cQnZTNFt4VRGAqS61HkUcKUqWWGMLz1EN1mQj2sEFNq8Ck6zRB44dXNw00idWGohua'); // ⚠️ Clave pública de Stripe
const stripePromise = loadStripe(stripePublicKey); // ⚠️ Clave pública de Stripe
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const DonationPage = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);

    const response = await fetch(backendUrl+'/api/donation/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount) }),
    });

    const session = await response.json();
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: session.id });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    let amount=85

    setLoading(true);

    const response = await fetch(backendUrl+'/api/donation/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount) }),
    });

    const session = await response.json();
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: session.id });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'center' }}>
      <h2>💖 Suscripciones</h2>
      <form onSubmit={handlePayment}>
        <div>Tralalaa</div>
        <button type="submit" className='btn btn-warning custom-bg-brown' disabled={loading}>
          {loading ? 'Redirigiendo...' : 'Pagar'}
        </button>
      </form>
      <div className='text-start'>
      
      </div>

    </div>
  );
};

export default DonationPage;