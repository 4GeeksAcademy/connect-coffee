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
            className="btn custom-bg-brown px-4 py-2 mt-3 shadow d-flex align-items-center"
            style={{ whiteSpace: 'nowrap' }}
          >
            Suscribirse
          </Link>
        );
    return { BotonDonar,BotonSuscribir };
}
