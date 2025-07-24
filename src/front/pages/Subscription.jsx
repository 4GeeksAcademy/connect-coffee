// Subscription.jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_API_PUBKEY;
const stripePromise = loadStripe(stripePublicKey); // ⚠️ Clave pública de Stripe
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Subscription = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

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

    <form onSubmit={handlePayment}>
      <div className="card mx-auto mt-5 shadow custom-fg-brown rounded-4 m-3 p-4" style={{ maxWidth: "32rem" }}>
        <div className="card-body text-center">
          <h5 className="card-title mb-4 ">
            Suscripción Premium
          </h5>

            <ul className="list-unstyled text-start mb-4">
              <li className="mb-2 mx-4"><i className="fa-solid fa-store mx-4"></i>Gestiona tu tienda</li>
              <li className="mb-2 mx-4"><i className="fa-solid fa-utensils mx-4"></i>Gestiona tu menú</li>
              <li className="mb-2 mx-4"><i className="fa-solid fa-qrcode mx-4"></i>Genera un QR para tu menú</li>
            </ul>

          <button type="submit" className="btn btn-outline-warning w-100">
            <i className="bi bi-credit-card-fill me-2"></i>
           {loading ? 'Redirigiendo...' : 'Pagar suscripción'}
          </button>
        </div>
      </div>
    </form>

    // <div style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'center' }}>
    //   <h2>Suscripciones</h2>
    //   <form onSubmit={handlePayment}>
    //     <div>Tralalaa</div>
    //     <button type="submit" className='btn btn-warning custom-bg-brown' disabled={loading}>
    //       {loading ? 'Redirigiendo...' : 'Pagar'}
    //     </button>
    //   </form>
    //   <div className='text-start'>
      
    //   </div>

    // </div>
  );
};

export default Subscription;