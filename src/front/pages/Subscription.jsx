// Subscription.jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from 'react-router-dom';

const stripePublicKey = import.meta.env.VITE_STRIPE_API_PUBKEY;
const stripePromise = loadStripe(stripePublicKey); // ⚠️ Clave pública de Stripe
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Subscription = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const handlePayment = async (e) => {
    e.preventDefault();
    let amount=85

    setLoading(true);
    if (store?.role != "ROLE_STORE"){
      navigate('/signup?type=Store')
    }
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
    <div className="card mx-auto mt-5 shadow-lg border-0 rounded-4 overflow-hidden" 
         style={{ 
           maxWidth: "32rem",
           background: "linear-gradient(to bottom, #f8f9fa 0%, #fff8f0 100%)",
           border: "1px solid rgba(124, 45, 18, 0.1)"
         }}>
      
      <div className="py-4 px-4 text-center" 
           style={{
             background: "linear-gradient(135deg, #7c2d12 0%, #d97706 100%)",
             color: "white"
           }}>
        <h4 className="mb-0 fw-bold">
          <i className="fas fa-crown me-2"></i>
          Suscripción Premium
        </h4>
        <p className="mb-0 small opacity-75">Desbloquea todo el potencial de tu cafetería</p>
      </div>

      <div className="card-body p-4">
        {/* BENEFICIOS DE SUSCRIBIRSE */}
        <ul className="list-unstyled mb-4">
          <li className="mb-3 p-3 d-flex align-items-center rounded-3" 
              style={{ backgroundColor: "rgba(124, 45, 18, 0.05)" }}>
            <div className="me-3 p-2 rounded-circle" 
                 style={{ 
                   backgroundColor: "rgba(124, 45, 18, 0.1)", 
                   width: "40px", 
                   height: "40px",
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center"
                 }}>
              <i className="fa-solid fa-store" style={{ color: "#7c2d12" }}></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold" style={{ color: "#7c2d12" }}>Gestión Completa</h6>
              <small className="text-muted">Control total de tu tienda</small>
            </div>
          </li>

          <li className="mb-3 p-3 d-flex align-items-center rounded-3" 
              style={{ backgroundColor: "rgba(124, 45, 18, 0.05)" }}>
            <div className="me-3 p-2 rounded-circle" 
                 style={{ 
                   backgroundColor: "rgba(124, 45, 18, 0.1)", 
                   width: "40px", 
                   height: "40px",
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center"
                 }}>
              <i className="fa-solid fa-utensils" style={{ color: "#7c2d12" }}></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold" style={{ color: "#7c2d12" }}>Menú Digital</h6>
              <small className="text-muted">Actualiza tus productos fácilmente</small>
            </div>
          </li>

          <li className="mb-4 p-3 d-flex align-items-center rounded-3" 
              style={{ backgroundColor: "rgba(124, 45, 18, 0.05)" }}>
            <div className="me-3 p-2 rounded-circle" 
                 style={{ 
                   backgroundColor: "rgba(124, 45, 18, 0.1)", 
                   width: "40px", 
                   height: "40px",
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center"
                 }}>
              <i className="fa-solid fa-qrcode" style={{ color: "#7c2d12" }}></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold" style={{ color: "#7c2d12" }}>QR Menú</h6>
              <small className="text-muted">Comparte tu menú al instante</small>
            </div>
          </li>
        </ul>

        {/* VALOR DE LA SUSCRIPCION */}
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: "#7c2d12" }}>USD 85.00<span className="fs-6 text-muted"></span></h3>
        </div>

        {/* BOTON DE PAGO */}
        <button 
          type="submit" 
          className="btn w-100 py-3 d-flex align-items-center justify-content-center"
          disabled={loading}
          style={{
            background: loading 
              ? "#d97706" 
              : "linear-gradient(135deg, #7c2d12 0%, #d97706 100%)",
            color: "white",
            borderRadius: "50px",
            border: "none",
            boxShadow: "0 4px 15px rgba(124, 45, 18, 0.3)",
            transition: "all 0.3s",
            fontWeight: "500"
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "translateY(-3px)")}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = "none")}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Procesando pago...
            </>
          ) : (
            <>
              <i className="bi bi-credit-card-fill me-2"></i>
              Comenzar suscripción
            </>
          )}
        </button>

        {/* LA GARANTIA*/}
        <div className="text-center mt-3">
          <small className="text-muted">
            <i className="fas fa-lock me-1"></i> Pago seguro · 
            <i className="fas fa-sync-alt ms-2 me-1"></i> Cancela cuando quieras
          </small>
        </div>
      </div>
    </div>
     <p className="lead mb-5 text-muted" style={{ fontSize: "1.25rem" }}></p>
  </form>
  );
};

export default Subscription;