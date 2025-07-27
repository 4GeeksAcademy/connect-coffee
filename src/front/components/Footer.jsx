export const Footer = () => {
  return (
    <footer
      className="footer mt-auto text-center text-light py-4 mt-5"
      style={{ backgroundColor: "#AB6B3E" }}
    >
      <div className="container">
        {/* Logo y título */}
        <div className="mb-3">
          <i
            className="fas fa-coffee me-2"
            style={{ fontSize: "1.2rem", color: "#4e342e" }}
          ></i>
          <span className="fw-bold" style={{ color: "#F5DEB3" }}>
            Coffee Connect
          </span>
        </div>

        {/* Redes sociales */}
        <div className="mb-3">
          <p className="mb-2" style={{ color: "#F5DEB3" }}>
            ¡Síguenos en nuestras redes!
          </p>
          {/* Instagram */}
          <a
            href="https://instagram.com/coffeeconnectapp/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
            style={{ color: "#F5DEB3", marginRight: "20px" }}
          >
            <i
              className="fab fa-instagram me-2"
              style={{ fontSize: "1.5rem" }}
            ></i>
            <span className="fw-bold">@Coffee-Connect</span>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com/coffee-connect"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
            style={{ color: "#F5DEB3" }}
          >
            <i
              className="fab fa-facebook me-2"
              style={{ fontSize: "1.5rem" }}
            ></i>
            <span className="fw-bold">@Coffee-Connect</span>
          </a>
        </div>

        {/* Línea divisoria */}
        <hr style={{ color: "#D2691E", opacity: "0.3" }} />

        {/* Copyright */}
        <div
          className="text-center"
          style={{ color: "#4e342e", fontSize: "0.9rem" }}
        >
          <p className="mb-1">
            © {new Date().getFullYear()} Coffee Connect. Todos los derechos
            reservados.
          </p>
          <p className="mb-0">
            <small>Conectando amantes del café con los mejores lugares. </small>
          </p>
        </div>
      </div>
    </footer>
  );
};
