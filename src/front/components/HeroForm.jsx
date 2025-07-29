import React from "react";
import { Link } from "react-router-dom";
import "../styles/hero.css";

const Hero = () => (
  <section className="bg-warm-brown hero-section text-center text-lg-start py-5">
    <div className="spacer-section" style={{ height: "50px" }} ></div>

    <div className="container-fluid">
      <div
        className="container-fluid hero-container"
        style={{
          backgroundImage:
            "url(https://plus.unsplash.com/premium_photo-1723813229606-0ba813aa6f0e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
          backgroundSize: "cover",
          minHeight: "80vh",
          position: "relative",
          borderRadius: "15px",
        }}
      >
        <div className="container h-100">
          <div className="row align-items-center h-100">
            <div className="col-12 text-center text-white" >
              <div
                className="hero-content p-4"
                style={{
                  backgroundColor: "#6b341093",
                  borderRadius: "15px",
                  maxWidth: "800px",
                  margin: "0 auto",
                  minHeight: "30vh",
                }}
              >
                <h1 className="display-4 fw-bold">Coffee Connect</h1>
                <p className="lead">
                  Conectamos tu amor por el café con los mejores lugares.
                  Explora, califica y guarda tus cafeterías favoritas en un solo
                  clic. ¡Tu próxima experiencia cafetera empieza aquí!
                </p>
                <div className="d-flex flex-column align-items-center gap-3">
                  <Link to="/signup">
                    <button
                      className="btn btn-lg mt-3 px-5 py-2 d-inline-flex align-items-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
                        color: "#7c2d12",
                        borderRadius: "50px",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.3s",
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 20px rgba(0, 0, 0, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow =
                          "0 4px 15px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      <span>Comenzar gratis</span>
                      <i
                        className="fas fa-arrow-right ms-2"
                        style={{ fontSize: "0.9rem" }}
                      ></i>
                    </button>
                  </Link>
                  <p className="mb-2">
                    ¿Ya tienes cuenta?
                    <Link to="/login" className="text-decoration-none ms-1">
                      Inicia Sesión
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="spacer-section" style={{ height: "75px" }}></div>
      {/* LINEA DE COLOR PARA DIVIDIR SESION DEL HERO*/}
      <div
        className="mx-auto mb-4"
        style={{
          width: "80px",
          height: "3px",
          background: "linear-gradient(90deg, #7c1212ff, #d97706)",
          borderRadius: "3px",
        }}
      ></div>

      <div className="spacer-section" style={{ height: "75px" }}></div>

      <div className="container">
        <div
          className="row align-items-center gx-5 flex-lg-row-reverse"
          id="descubre"
        >
          <div className="col-12 col-lg-6 mb-4 mb-lg-0">
            <h1 className="display-4 fw-bold text-dark-roast">
              Filtra y encuentra tu Cafetería Ideal
            </h1>
            <p className="lead text-black">
              Descubre todas nuestras cafeterías en un solo lugar. Filtra por lo
              que más te importa: ¿WIFI rápido? ¿Pet friendly? ¿Espacios para
              fumadores o opciones sin TACC? Personaliza tu búsqueda y encuentra
              el lugar perfecto para ti.
            </p>
            <div className="d-flex gap-3">
              <Link to="/home">
                <button
                  className="btn btn-lg mt-3 px-5 py-2 d-inline-flex align-items-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #7c2d12 0%, #d97706 100%)",
                    color: "white",
                    borderRadius: "50px",
                    border: "none",
                    boxShadow: "0 4px 15px rgba(124, 45, 18, 0.3)",
                    transition: "all 0.3s",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-3px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "none")
                  }
                >
                  <span>Explorar</span>
                  <i
                    className="fas fa-arrow-right ms-2"
                    style={{ fontSize: "0.9rem" }}
                  ></i>
                </button>
              </Link>
            </div>
          </div>
          <div className="col-12 col-lg-6 hero-img-col">
            {/* CARRUSEL */}
            <div
              id="heroCarousel"
              className="carousel slide rounded-3 shadow-lg"
              data-bs-ride="carousel"
              data-bs-interval="2500"
            >
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <img
                    src="https://images.pexels.com/photos/15028372/pexels-photo-15028372.jpeg"
                    className="rounded-4 d-block w-100 img-fluid"
                    alt="Taza de café"
                    style={{ height: "400px", objectFit: "cover" }}
                  />
                </div>
                <div className="carousel-item">
                  <img
                    src="https://images.unsplash.com/photo-1712746438534-f0cc699b0b90?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    className="rounded-4 d-block w-100 img-fluid"
                    alt="Granos de café"
                    style={{ height: "400px", objectFit: "cover" }}
                  />
                </div>
                <div className="carousel-item">
                  <img
                    src="https://images.unsplash.com/photo-1523908511403-7fc7b25592f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1800&q=80"
                    className="rounded-4 d-block w-100 img-fluid"
                    alt="Granos de café"
                    style={{ height: "400px", objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="spacer-section" style={{ height: "150px" }}></div>

    <div
      className="container-fluid hero-container"
      style={{
        backgroundImage:
          "url(https://plus.unsplash.com/premium_photo-1682096860502-ac3cbdc357e3?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        backgroundSize: "cover",
        minHeight: "80vh",
        position: "relative",
        borderRadius: "15px",
      }}
    >
      <div className="container h-100">
        <div className="row align-items-center h-100">
          <div className="col-12 text-center text-white">
            <div
              className="hero-content p-4"
              style={{
                backgroundColor: "#6b341093",
                borderRadius: "15px",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <h1 className="display-4 fw-bold">¿Tienes una cafetería? </h1>
              <p className="lead">
                Únete a nuestra comunidad y llega a más clientes. Gestiona tu
                perfil, promociona tus especialidades y conecta con amantes del
                cáfe.
              </p>
              <div className="d-flex flex-column align-items-center gap-3">
                <Link to="/signup?type=Store">
                  <button
                    className="btn btn-lg mt-3 px-5 py-2 d-inline-flex align-items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
                      color: "#7c2d12",
                      borderRadius: "50px",
                      border: "none",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s",
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow =
                        "0 4px 15px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    <span>Únete</span>
                    <i
                      className="fas fa-arrow-right ms-2"
                      style={{ fontSize: "0.9rem" }}
                    ></i>
                  </button>
                </Link>

                <div className="text-center">
                  <p className="mb-2">
                    ¿Ya tienes cuenta de cafetería?
                    <Link
                      to="/login?type=Store"
                      className="text-decoration-none ms-1"
                    >
                      Inicia Sesión
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="spacer-section" style={{ height: "75px" }}></div>
    {/* LINEA DE COLOR PARA DIVIDIR SESION DEL HERO*/}
    <div
      className="mx-auto mb-4"
      style={{
        width: "80px",
        height: "3px",
        background: "linear-gradient(90deg, #7c1212ff, #d97706)",
        borderRadius: "3px",
      }}
    ></div>

    <div className="spacer-section" style={{ height: "75px" }}></div>

    <div className="container">
      <div className="row align-items-center gx-5">
        <div className="col-12 col-lg-6 mb-4 mb-lg-0">
          <h1 className="display-4 fw-bold text-dark-roast">
            Una app con alma de café
          </h1>
          <p className="lead text-black">
            Somos amantes del café, como tú, que creemos en momentos
            compartidos, risas entre sorbos y lugares que se sienten como casa.
          </p>
          <div className="d-flex gap-3">
            <Link to="/about#link">
              <button
                className="btn btn-lg mt-3 px-5 py-2 d-inline-flex align-items-center"
                style={{
                  background:
                    "linear-gradient(135deg, #7c2d12 0%, #d97706 100%)",
                  color: "white",
                  borderRadius: "50px",
                  border: "none",
                  boxShadow: "0 4px 15px rgba(124, 45, 18, 0.3)",
                  transition: "all 0.3s",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-3px)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                <span>Conócenos</span>
                <i
                  className="fas fa-arrow-right ms-2"
                  style={{ fontSize: "0.9rem" }}
                ></i>
              </button>
            </Link>
          </div>
        </div>
        <div className="col-12 col-lg-6 hero-img-col">
          <img
            src="https://plus.unsplash.com/premium_photo-1682148049995-bf6558f9523d?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Cafetería con clientes"
            className="img-fluid rounded-3 hero-img shadow-lg"
          />
        </div>
      </div>
    </div>
    <div className="spacer-section" style={{ height: "120px" }}></div>

    <div className="coffee-beans-fall">
      {[...Array(35)].map((_, i) => (
        <div
          key={i}
          className="coffee-bean"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            backgroundColor: i % 2 ? "#7c2d12" : "#d97706a4",
            transform: `scale(${0.5 + Math.random() * 0.7})`,
          }}
        />
      ))}
    </div>
  </section>
);
export default Hero;
