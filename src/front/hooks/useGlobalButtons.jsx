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
            className="btn btn-sm px-3 py-2 shadow d-flex align-items-center"
            style={{
													backgroundColor: '#8b4513',
													color: '#fff',
													border: 'none',
													borderRadius: '6px',
													fontWeight: '500',
													transition: 'all 0.2s ease'
												}}
												onMouseEnter={(e) => {
													e.target.style.backgroundColor = '#6b4423';
												}}
												onMouseLeave={(e) => {
													e.target.style.backgroundColor = '#8b4513';
												}}
          >
            Suscribirse
          </Link>
        );
    return { BotonDonar,BotonSuscribir };
}
