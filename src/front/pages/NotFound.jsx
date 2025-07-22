import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const NotFound = () => {
const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          window.location.href = "/";
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-center min-vh-100 bg-warning-subtle p-4">
      {/* SVG agrandado */}
      <div className="mb-4">
        <svg
          width="280"
          height="250"
          viewBox="0 0 130 90"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>
            {`
              .steam {
                animation: steamUp 2s infinite ease-in-out;
              }

              .walk {
                animation: walkCycle 0.6s infinite ease-in-out alternate;
              }

              .eye-left, .eye-right {
                animation: eyeDrift 3s infinite alternate;
              }

              @keyframes steamUp {
                0% { opacity: 0.3; transform: translateY(0); }
                50% { opacity: 0.6; transform: translateY(-5px); }
                100% { opacity: 0.3; transform: translateY(0); }
              }

              @keyframes walkCycle {
                0% { transform: translateX(-1px) rotate(-1deg); }
                100% { transform: translateX(1px) rotate(1deg); }
              }

              @keyframes eyeDrift {
                0% { transform: translate(0, 0); }
                50% { transform: translate(1px, -1px); }
                100% { transform: translate(-1px, 1px); }
              }
            `}
          </style>

          {/* Taza con mochila */}
          <g className="walk" transform="translate(0,10)">
            <rect x="10" y="25" width="8" height="20" rx="3" fill="#8ecae6" stroke="#333" strokeWidth="1" />
            <rect x="18" y="20" width="36" height="30" rx="6" fill="#fff" stroke="#333" strokeWidth="2"/>
            <circle cx="56" cy="30" r="6" fill="#fff" stroke="#333" strokeWidth="2"/>
            <g className="eye-left">
              <circle cx="28" cy="35" r="3" fill="#000" />
              <circle cx="28" cy="35" r="1" fill="#fff" transform="translate(1, -1)" />
            </g>
            <g className="eye-right">
              <circle cx="40" cy="35" r="3" fill="#000" />
              <circle cx="40" cy="35" r="1" fill="#fff" transform="translate(-1, -1)" />
            </g>
            <path d="M30 43 Q34 38 38 43" stroke="#333" strokeWidth="2" fill="none" />
            <line x1="24" y1="50" x2="22" y2="58" stroke="#333" strokeWidth="2"/>
            <line x1="44" y1="50" x2="46" y2="58" stroke="#333" strokeWidth="2"/>
          </g>

          {/* Vapor */}
          <g className="steam">
            <path d="M30 18 C28 14, 32 10, 30 6" stroke="#aaa" strokeWidth="2" fill="none" />
            <path d="M38 18 C36 14, 40 10, 38 6" stroke="#aaa" strokeWidth="2" fill="none" />
          </g>

          {/* Cartelito más ancho */}
          <g transform="translate(70, 12)">
            <rect x="0" y="0" width="52" height="16" rx="3" fill="#fff3cd" stroke="#333" strokeWidth="1.5" />
            <text x="26" y="11" fontSize="6" textAnchor="middle" fill="#333" fontFamily="sans-serif">¿Dónde estoy?</text>
            <line x1="26" y1="16" x2="26" y2="20" stroke="#333" strokeWidth="2"/>
          </g>
        </svg>
      </div>

      {/* Texto más chico */}
      <h1 className="h3 fw-bold text-dark mb-2">404 - Página no encontrada</h1>
      <p className="lead text-muted mb-3">¡Oops! Este café se perdió en el código... ☕</p>
      <p className="text-secondary">
        Redirigiendo al inicio en <strong>{countdown}</strong> segundos...
      </p>
      <a href="/" className="btn btn-outline-dark mt-3">
        Ir al inicio ahora
      </a>
    </div>
  );
}

export default NotFound;