import { Link } from 'react-router-dom';

export function useGlobalButtons() {
const BotonDonar = () => (
      <Link
        to="/donations"
        className="btn custom-bg-brown px-4 py-2 mt-3 shadow d-flex align-items-center"
        style={{ whiteSpace: 'nowrap' }}
      >
        ❤️ Donar Ahora
      </Link>
    );
    const BotonSuscribir = () => (
            <Link
              to="/payment"
              className="nav-link px-3 py-2 rounded"
              style={{
                color: '#6b4423',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e8d5c4';
                e.target.style.color = '#8b4513';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6b4423';
              }}
            >
              <i className="fa-solid fa-dollar-sign"></i>
            Precios
          </Link>
        );
    return { BotonDonar,BotonSuscribir };
}

