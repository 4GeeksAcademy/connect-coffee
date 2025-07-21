import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TermsandCond = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-5">
              <h2 className="mb-4 text-center">
                <i className="fas fa-file-contract me-2" style={{ color: '#8b4513' }}></i>
                Términos y Condiciones de <strong style={{ color: '#8b4513' }}>Coffee Connect</strong>
              </h2>

              <div className="alert alert-info mb-4">
                <i className="fas fa-info-circle me-2"></i>
                Al usar Coffee Connect, aceptas estos términos. Si no estás de acuerdo, no uses el servicio.
              </div>

              <h5 className="mt-4 text-primary">📝 Lo Básico</h5>
              <p>Coffee Connect conecta amantes del café con cafeterías locales. Es simple: buscas, encuentras y disfrutas.
                Para las cafeterías, es una vidriera digital con pago único (sin suscripciones).</p>

              <h5 className="mt-4 text-primary">👤 Tu Cuenta</h5>
              <p><strong>Usuarios:</strong> Registrate con datos reales. Tu contraseña es tu responsabilidad.</p>
              <p><strong>Cafeterías:</strong> Necesitas proporcionar informacion comercial verificable (nombre legal, dirección, contacto).</p>

              <h5 className="mt-4 text-primary">✅ Uso Responsable</h5>
              <ul className="list-group list-group-flush mb-3">
                <li className="list-group-item">No hagas nada ilegal o dañino</li>
                <li className="list-group-item">No publiques informacion falsa o engañosa</li>
                <li className="list-group-item">Respeta la propiedad intelectual</li>
                <li className="list-group-item">No intentes hackear o romper la plataforma</li>
              </ul>

              <h5 className="mt-4 text-primary">☕ Para Cafeterías</h5>
              <div className="bg-light p-3 rounded mb-3">
                <p className="mb-2">Al registrarte obtienes:</p>
                <ul className="mb-0">
                  <li>Panel para gestionar tu info</li>
                  <li>Actualización de menús y horarios</li>
                  <li>Estadísticas básicas</li>
                  <li>Visibilidad en búsquedas</li>
                </ul>
              </div>

              <h5 className="mt-4 text-primary">🔒 Privacidad</h5>
              <p>Cuidamos tu información. No la vendemos ni compartimos sin tu permiso.</p>

              <h5 className="mt-4 text-primary">⚖️ Responsabilidad</h5>
              <p>Coffee Connect es una plataforma de conexión. No somos responsables por la calidad del café
                ni los servicios de cada cafetería. La plataforma se ofrece "tal cual".</p>

              <h5 className="mt-4 text-primary">🔄 Cambios</h5>
              <p>Podemos actualizar estos términos. Si sigue usando Coffee Connect después de los cambios,
                significa que los acepta.</p>

              <h5 className="mt-4 text-primary">📧 Contacto</h5>
              <div className="alert alert-secondary">
                <p className="mb-1"><strong>¿Dudas?</strong> Escribenos a:</p>
                <p className="mb-0">📧 ayuda@coffeeconnect.com</p>
              </div>

              <hr className="my-4" />

              <div className="text-center">
                <p className="text-muted mb-3">
                  <small>Última actualización: Julio 2025 | Proyecto, Final</small>
                </p>
                <Link to="/" className="btn btn-outline-primary me-2">
                  <i className="fas fa-home me-2"></i>Volver al Inicio
                </Link>
                <Link to="/signup?type=Store" className="btn text-white" style={{ backgroundColor: '#8b4513' }}>
                  <i className="fas fa-store me-2"></i>Registrar mi Cafetería
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsandCond;