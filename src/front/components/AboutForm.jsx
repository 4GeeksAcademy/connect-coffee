import React from "react";
import { Link } from "react-router-dom";
import "../styles/about.css";

const About = () => {
  return (
    <section
      className="about-section"
      style={{ backgroundColor: "var(--primary-bg-color)" }}
    >
      {/* Hero del About */}
      <div className="about-hero py-5">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div
              className="col-lg-8 text-center position-relative"
              style={{ zIndex: 2 }}
            >
              <h1
                className="display-4 fw-bold mb-4"
                style={{ color: "var(--primary-bg-color)" }}
              >
                Nuestra Historia
              </h1>
              <p className="lead text-white mb-0">
                Conectando amantes del café con experiencias únicas
              </p>
            </div>
          </div>
        </div>
        <div className="hero-overlay"></div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center g-5">
          <div className="col-lg-10">
            {/* Sección de introducción */}
            <div className="row align-items-center mb-5 g-4">
              <div className="col-md-6">
                <div className="about-img">
                  <img
                    src="https://images.unsplash.com/photo-1656699218814-1990a74d03b5?q=80&w=1222&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Café de especialidad"
                    className="img-fluid"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <h2
                  className="h1 mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  <i
                    className="bi bi-house-heart-fill me-3"
                    style={{ color: "var(--accent-color)" }}
                  ></i>
                  Nuestra Pasión
                </h2>
                <p
                  className="fs-5 mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  En{" "}
                  <strong style={{ color: "var(--accent-color)" }}>
                    CoffeeConnect
                  </strong>{" "}
                  no vendemos café, creamos conexiones. Somos buscadores de esos
                  rincones donde el primer sorbo te hace sentir en casa, donde
                  cada cafetería es un universo por descubrir. Nos mueve unir
                  personas con su lugar ideal, porque sabemos que detrás de un
                  buen café siempre hay una experiencia esperando a ser vivida.
                </p>
              </div>
            </div>

            {/* Beneficios de usar la app */}
            <div className="text-center mb-5">
              <h2
                className="display-5 fw-bold mb-5"
                style={{ color: "var(--text-primary)" }}
              >
                Beneficios de usar CoffeeConnect
              </h2>

              <div className="row g-4">
                {/* Beneficio 1 */}
                <div className="col-md-4">
                  <div className="benefit-card h-100 p-4">
                    <div className="benefit-img mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1603052875332-748a51d465bb?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Descubre cafeterías"
                        className="img-fluid"
                      />
                    </div>
                    <h3
                      className="h4 mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <i
                        className="bi bi-binoculars-fill me-2"
                        style={{ color: "var(--accent-color)" }}
                      ></i>
                      Descubre
                    </h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                      Encuentra cafeterías únicas que se adapten a tu estilo y
                      preferencias.
                    </p>
                  </div>
                </div>

                {/* Beneficio 2 */}
                <div className="col-md-4">
                  <div className="benefit-card h-100 p-4">
                    <div className="benefit-img mb-4">
                      <img
                        src="https://plus.unsplash.com/premium_photo-1732818134741-33f77fa8005e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Comparte experiencias"
                        className="img-fluid"
                      />
                    </div>
                    <h3
                      className="h4 mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <i
                        className="bi bi-chat-square-heart-fill me-2"
                        style={{ color: "var(--accent-color)" }}
                      ></i>
                      Comparte
                    </h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                      Deja reseñas y fotos para ayudar a otros amantes del café.
                    </p>
                  </div>
                </div>

                {/* Beneficio 3 */}
                <div className="col-md-4">
                  <div className="benefit-card h-100 p-4">
                    <div className="benefit-img mb-4">
                      <img
                        src="https://plus.unsplash.com/premium_photo-1679503586469-3ba3b083307b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDR8fHxlbnwwfHx8fHw%3D"
                        alt="Ahorra tiempo"
                        className="img-fluid"
                      />
                    </div>
                    <h3
                      className="h4 mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <i
                        className="bi bi-clock-fill me-2"
                        style={{ color: "var(--accent-color)" }}
                      ></i>
                      Ahorra tiempo
                    </h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                      Filtra por características como Wi-Fi, pet-friendly o
                      menús especiales.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Para cafeterías */}
            <div className="row align-items-center my-5 g-4">
              <div className="col-md-6 order-md-2">
                <div
                  id="cafeCarousel"
                  className="carousel slide"
                  data-bs-ride="carousel"
                >
                  <div className="carousel-inner rounded-4 shadow-lg">
                    {/* Imágenes del carrusel */}
                    {[
                      "https://images.unsplash.com/photo-1464979681340-bdd28a61699e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                      "https://images.unsplash.com/photo-1728044849321-4cbffc50cc1d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                      "https://plus.unsplash.com/premium_photo-1723809844242-237f0ef627c6?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    ].map((img, index) => (
                      <div
                        key={index}
                        className={`carousel-item ${
                          index === 0 ? "active" : ""
                        }`}
                      >
                        <img
                          src={img}
                          className="d-block w-100"
                          alt={`Cafetería ${index + 1}`}
                          style={{ height: "400px", objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-md-6 order-md-1">
                <h2
                  className="h1 mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  <i
                    className="bi bi-shop-window me-3"
                    style={{ color: "var(--accent-color)" }}
                  ></i>
                  Para Cafeterías
                </h2>
                <p
                  className="fs-5 mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Si tenés una cafetería, CoffeeConnect te ofrece herramientas
                  poderosas para destacar tu negocio.
                </p>
                <ul className="feature-list">
                  {[
                    "Muestra tu carta y especialidades",
                    "Atrae a tu público ideal",
                    "Recibe feedback valioso",
                    "Destaca tus características únicas",
                  ].map((item, index) => (
                    <li key={index} className="mb-3">
                      <i
                        className="bi bi-check-circle-fill me-2"
                        style={{ color: "var(--accent-color)" }}
                      ></i>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Cita final */}
            <div className="text-center py-5 my-5">
              <div className="quote-icon mb-4">
                <i className="bi bi-quote"></i>
              </div>
              <blockquote
                className="m-0 fs-2 fst-italic"
                style={{ color: "var(--text-primary)" }}
              >
                Porque cada café cuenta una historia.
                <br />
                <span style={{ color: "var(--accent-color)" }}>
                  Y queremos ayudarte a encontrar la tuya.
                </span>
              </blockquote>
              <Link to="/signup" className="btn btn-custom mt-4">
                Únete a nuestra comunidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
