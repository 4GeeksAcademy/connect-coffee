import React from "react";
import { Link } from "react-router-dom";
import "../styles/hero.css";

const Hero = () => (
  <section className="bg-warm-brown hero-section text-center text-lg-start py-5">
    <div className="spacer-section" style={{ height: "120px" }}></div>
    <div className="container">
      <div
        className="row align-items-center gx-5 flex-lg-row-reverse"
        id="descubre"
      >
        <div className="col-12 col-lg-6 mb-4 mb-lg-0">
          <h1 className="display-4 fw-bold text-dark-roast">
            Descubre las mejores cafeterías cerca de ti
          </h1>
          <p className="lead text-black">
            Encuentra, califica y comparte tus experiencias en cafeterías
            locales. Accede a recomendaciones personalizadas basadas en tus
            gustos.
          </p>
          <div className="d-flex gap-3">
            <Link to="/signup">
              <button className="btn btn-primary btn-lg mt-3 px-4">
                Comenzar gratis
              </button>
            </Link>
          </div>
        </div>
        <div className="col-12 col-lg-6 hero-img-col">
          <div
            id="heroCarousel"
            className="carousel slide rounded-3 shadow-lg"
            data-bs-ride="carousel"
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
    <div className="spacer-section" style={{ height: "130px" }}></div>
    <div className="container">
      <div className="row align-items-center gx-5">
        <div className="col-12 col-lg-6 mb-4 mb-lg-0">
          <h1 className="display-4 fw-bold text-dark-roast">
            ¿Tienes una cafetería?
          </h1>
          <p className="lead text-black">
            Únete a nuestra comunidad y llega a más clientes. Gestiona tu
            perfil, promociona tus especialidades y conecta con amantes del
            café.
          </p>
          <div className="d-flex gap-3">
            <Link to="/login?type=Store">
              <button className="btn btn-primary btn-lg mt-3 px-4">
                Registra tu cafetería
              </button>
            </Link>
          </div>
        </div>
        <div className="col-12 col-lg-6 hero-img-col">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1800&q=80"
            alt="Cafetería con clientes"
            className="img-fluid rounded-3 hero-img shadow-lg"
          />
        </div>
      </div>
    </div>
    <div className="spacer-section" style={{ height: "130px" }}></div>
    <div
      className="container-fluid hero-container"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1461988091159-192b6df7054f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1800&q=80)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "80vh",
        position: "relative",
      }}
    >
      <div className="container h-100">
        <div className="row align-items-center h-100">
          <div className="col-12 text-center text-white">
            <div
              className="hero-content p-4"
              style={{
                backgroundColor: "#6b341093", // #7c2d12 con opacidad
                borderRadius: "15px",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <h1 className="display-4 fw-bold">Coffee Connect</h1>
              <p className="lead">
                Para los que aman el cafecito y los buenos datos. Cafeterías con
                estilo, rincones tranqui y espacios que invitan a quedarse. Todo
                en un solo lugar, sin vueltas.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Link to="/about">
                  <button className="btn btn-primary btn-lg mt-3 px-4">
                    Conocenos
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="spacer-section" style={{ height: "50px" }}></div>
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
