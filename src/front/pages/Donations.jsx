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

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'center' }}>
      <h2>💖 Donaciones</h2>
      <form onSubmit={handleDonate}>
        <input
          type="number"
          placeholder="Un cafecito? (USD)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className='form-control rounded-3 my-2'
        />
        <button type="submit" className='btn btn-warning custom-bg-brown' disabled={loading}>
          {loading ? 'Redirigiendo...' : 'Donar'}
        </button>
      </form>
      <div className='text-start'>
        <br />
        <h5>Datos de prueba</h5> 
        <hr />
        <p><strong>Nro de tarjeta:</strong> 4242 4242 4242 4242</p>
        <p><strong>Vencimiento:</strong> 12/34</p>
        <p><strong>CVC:</strong>  Cualquier CVC de tres dígitos (cuatro dígitos si usas una tarjeta American Express)</p>
        <p><strong>Otros:</strong>  Usa cualquier valor para los demás campos del formulario.</p>
        <h5 className='text-warning bg-black p-2 rounded-4'>TOMAR NOTA DE ESTOS DATOS PARA EL SIGUIENTE PASO</h5>
      </div>

    </div>
  );
};

export default DonationPage;