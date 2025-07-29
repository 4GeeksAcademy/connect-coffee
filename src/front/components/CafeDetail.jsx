import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { getFrontStorePoints } from '../services/api_userpoints.js'
import ReviewForm from './ReviewForm.jsx';
import { favoriteGet, favoriteDelete, favoriteCreate } from '../services/api_favorite.js'
import ImageNotFound from "../assets/img/image-not-found.png"
import MiniMenu from './MiniMenu.jsx';
import QrCode from './QrCode.jsx'

const CafeDetail = ({ cafeData, onBack }) => {
  const { store, dispatch } = useGlobalReducer();
  const [activeTab, setActiveTab] = useState('menu');
  const [isFavorite, setIsFavorite] = useState(false);
  const [apiReviews, setApiReviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUser, setIsUser] = useState(false);
  const [disableFavorite, setDisableFavorite] = useState(false);

  useEffect(() => {
    if (cafeData?.id && store.token) {
      if (store?.role == 'User') {
        loadApiReviews();
        loadFavorite();
        setDisableFavorite(false)
      } else {
        setDisableFavorite(true)
      }
    }
  }, [store.role]);

  useEffect(() => {
    const carouselElement = document.querySelector('#cafeImageCarousel');
    if (carouselElement && window.bootstrap) {
      new window.bootstrap.Carousel(carouselElement, {
        interval: 5000,
        ride: 'carousel'
      });
    }
  }, [cafeData.images]);

  const loadApiReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFrontStorePoints(cafeData?.id);

      if (response && response.ok && response.data) {
        setApiReviews(response.data);
        setIsUser(true);
      } else {
        const errorMsg = response?.msg || 'Error al cargar las reseñas';
        setError(errorMsg);
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const reloadReviews = async () => {
    try {
      const response = await getFrontStorePoints(cafeData?.id);
      if (response && response.ok && response.data) {
        setApiReviews(response.data);
      }
    } catch (err) {
      console.error('Error recargando reseñas:', err);
    }
  };

  const handleReviewSubmitted = (response) => {
    reloadReviews();
    setTimeout(() => {
      document.getElementById('reviews-list')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 1000);
  };

  const loadFavorite = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await favoriteGet(store.token);

      if (response && response.ok && response.data) {
        const isInFavorites = response.data.some(store => store.id === cafeData?.id);
        if (isInFavorites) {
          setIsFavorite(true)
        }
      } else {
        const errorMsg = response?.msg || 'Error al cargar los favoritos';
        setError(errorMsg);
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterConfig = {
    wifi: { icon: '📶', label: 'WiFi', field: 'wifi' },
    pet_friendly: { icon: '🐕', label: 'Pet Friendly', field: 'pet_friendly' },
    gluten_free: { icon: '🚫', label: 'Sin TACC', field: 'gluten_free' },
    smoking_area: { icon: '🚬', label: 'Zona Fumadores', field: 'smoking_area' },
    quiet_space: { icon: '🤫', label: 'Espacios Tranquilos', field: 'quiet_space' }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-warning' : 'text-muted'}>
        ★
      </span>
    ));
  };

  const toggleFavorite = async () => {
    const form = {
      "store_id": cafeData?.id
    }

    if (isFavorite) {
      const response = await favoriteDelete(store.token, form);
      if (response?.ok) {
        localStorage.setItem("favorites", JSON.stringify(response?.data));
        dispatch({ type: "favorites", payload: JSON.stringify(response?.data) });
        setIsFavorite(false);
      }
    } else {
      const response = await favoriteCreate(store.token, form);
      if (response?.ok) {
        localStorage.setItem("favorites", JSON.stringify(response?.data));
        dispatch({ type: "favorites", payload: JSON.stringify(response?.data) });
        setIsFavorite(true);
      }
    }
  };

  const getActiveFeatures = () => {
    const features = [];
    Object.entries(filterConfig).forEach(([key, config]) => {
      if (cafeData[config.field]) {
        features.push({ key, ...config });
      }
    });
    return features;
  };

  // Validación de datos
  if (!cafeData) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#F6E0C4" }}
      >
        <div className="text-center">
          <i className="fas fa-coffee fa-4x text-muted mb-3"></i>
          <h3 className="text-muted">Cafetería no encontrada</h3>
          <button className="btn btn-warning mt-3" onClick={onBack}>
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#F6E0C4" }}>
      <div className="container py-4">
        {/* Botón de volver */}
        <div className="mb-4">
          <button
            onClick={onBack}
            className="btn px-4 py-2 d-inline-flex align-items-center"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#7c2d12",
              border: "2px solid #d97706",
              borderRadius: "50px",
              fontWeight: "500",
              boxShadow: "0 2px 6px rgba(124, 45, 18, 0.1)",
              transition: "all 0.3s",
              backdropFilter: "blur(4px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(217, 119, 6, 0.1)";
              e.currentTarget.style.transform = "translateX(-4px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(124, 45, 18, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(124, 45, 18, 0.1)";
            }}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Volver a cafeterías
          </button>
        </div>

        {/* Header con imagen principal */}
        <div className="card mb-4 border-0 shadow">
          <div className="row g-0">
            <div className="col-md-8">
              <img
                src={cafeData.images?.[0]?.url || ImageNotFound}
                className="img-fluid"
                alt={cafeData.name}
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain"
                }}
                onError={(e) => {
                  e.target.src = ImageNotFound;
                }}
              />
            </div>
            <div className="col-md-4">
              <div className="card-body h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={
                        cafeData.logo_url ||
                        cafeData.image_url ||
                        ImageNotFound
                      }
                      alt="Logo"
                      className="rounded-circle me-3"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.src = ImageNotFound;
                      }}
                    />
                    <div>
                      <h2 className="mb-1" style={{ color: "#8B4513" }}>
                        {cafeData.name}
                      </h2>
                      <div className="d-flex align-items-center">
                        {renderStars(
                          cafeData.rating || cafeData.total_points || 0
                        )}
                        <span className="ms-2 fw-bold">
                          {(
                            cafeData.rating ||
                            cafeData.total_points ||
                            0
                          ).toFixed(1)}
                        </span>
                        <span className="ms-1 text-muted">
                          ({cafeData.points?.length || 0} reseñas)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted mb-3">
                    {cafeData.description ||
                      "Cafetería acogedora con excelente ambiente"}
                  </p>
                  <p className="text-muted mb-3">
                    <strong>Dirección:</strong>{" "}
                    {cafeData.address || "Dirección no disponible"}
                  </p>

                  <div className="mb-3">
                    <span
                      className={`badge px-3 py-2 ${cafeData.is_active ? "bg-success" : "bg-danger"
                        }`}
                    >
                      {cafeData.is_active ? "🟢 Abierto ahora" : "🔴 Cerrado"}
                    </span>
                  </div>

                  <div className="text-center">
                    <div className="d-inline-block p-3 bg-white rounded-3 shadow-sm border"
                      style={{ borderColor: '#d4a574' }}>
                      <QrCode id_menu={cafeData.id} />
                    </div>
                    <p className="mt-2 mb-0 small fw-light" style={{ color: '#8b4513' }}>
                      Escanea para ver el menú digital
                    </p>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {getActiveFeatures().map((feature) => (
                      <span
                        key={feature.key}
                        className="badge"
                        style={{ backgroundColor: "#D2B48C", color: "#8B4513" }}
                      >
                        {feature.icon} {feature.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn flex-fill"
                    style={{
                      backgroundColor: "#8B4513",
                      color: "white",
                      border: "none",
                    }}
                    onClick={toggleFavorite}
                    disabled={disableFavorite}
                  >
                    {isFavorite ? "❤️ En Favoritos" : "🤍 Agregar a Favoritos"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="d-flex justify-content-center mb-4">
          <div className="d-flex gap-2">
            {[
              { id: 'menu', label: 'Menú', icon: '📋' },
              { id: 'photos', label: 'Fotos', icon: '📸' },
              { id: 'reviews', label: 'Reseñas', icon: 'ℹ️' },
              { id: 'info', label: 'Contactanos', icon: '💬' }
            ].filter(tab => tab.id !== 'reviews' || isUser).map(tab => (
              <button
                key={tab.id}
                className="btn px-4 py-2"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  backgroundColor: activeTab === tab.id ? '#8B4513' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#8B4513',
                  border: '1px solid #8B4513',
                  borderRadius: '20px'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de tabs */}
        {activeTab === "info" && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header text-white"
                  style={{ backgroundColor: "#8B4513" }}
                >
                  <h5 className="mb-0">💬 Chat con el cliente</h5>
                </div>
                <div className="card-body" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {/* Mensajes simulados */}
                  <div className="mb-2">
                    <div className="text-muted small">Cliente:</div>
                    <div className="p-2 bg-light rounded">Hola, ¿hay opciones sin cafeína?</div>
                  </div>
                  <div className="mb-2 text-end">
                    <div className="text-muted small">Tienda:</div>
                    <div className="p-2 bg-success bg-gradient text-white rounded d-inline-block">¡Hola! Sí, tenemos té y chocolate caliente ☕</div>
                  </div>
                </div>
                <div className="card-footer">
                  <form className="d-flex">
                    <input
                      type="text"
                      className="form-control me-2"
                      placeholder="Pronto podrás dejarnos tu mensaje..."
                      disabled
                    />
                    <button type="submit" className="btn btn-secondary disabled">Enviar</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="row">
            <div className="col-12">
              <MiniMenu storeId={cafeData.id} />
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="d-flex justify-content-center mb-4">
            {cafeData.images && cafeData.images.length > 0 ? (
              <div
                id="cafeImageCarousel"
                className="carousel slide"
                data-bs-ride="carousel"
                style={{ maxWidth: '600px', width: '100%' }}
              >
                <div className="carousel-inner">
                  {cafeData.images.map((image, index) => (
                    <div
                      className={`carousel-item ${index === 0 ? 'active' : ''}`}
                      key={index}
                    >
                      <img
                        src={typeof image === 'string' ? image : image.url}
                        className="d-block w-100"
                        alt={`${cafeData.name} - Foto ${index + 1}`}
                        style={{ height: '300px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = ImageNotFound;
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Controles del carousel */}
                {cafeData.images.length > 1 && (
                  <>
                    <button
                      className="carousel-control-prev"
                      type="button"
                      data-bs-target="#cafeImageCarousel"
                      data-bs-slide="prev"
                    >
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Anterior</span>
                    </button>
                    <button
                      className="carousel-control-next"
                      type="button"
                      data-bs-target="#cafeImageCarousel"
                      data-bs-slide="next"
                    >
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Siguiente</span>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="col-12 text-center py-5">
                <i className="fas fa-camera fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">Fotos no disponibles</h5>
                <p className="text-muted">Esta cafetería aún no ha subido fotos adicionales</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="row">
            <div className="col-12">
              {/* Header de reseñas */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header d-flex justify-content-between align-items-center"
                  style={{ backgroundColor: "#8B4513", color: "white" }}>
                  <h5 className="mb-0">
                    <i className="fas fa-star me-2"></i>
                    Reseñas ({apiReviews?.length || 0})
                  </h5>
                  <div className="d-flex align-items-center">
                    {renderStars(cafeData.rating || cafeData.total_points || 0)}
                    <span className="ms-2 fw-bold">
                      {(cafeData.rating || cafeData.total_points || 0).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Formulario de reseña */}
                <div className="card-body">
                  {isUser ? (
                    <div className="mb-4 p-3 bg-light rounded">
                      <h6 className="mb-3">
                        <i className="fas fa-edit me-2"></i>
                        Comparte tu experiencia
                      </h6>
                      <ReviewForm
                        store_id={cafeData?.id}
                        onReviewSubmitted={handleReviewSubmitted}
                      />
                    </div>
                  ) : (
                    <div className="alert alert-info mb-4">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>¿Quieres escribir una reseña?</strong>
                      <a href="/login" className="ms-2 text-decoration-none">
                        Inicia sesión
                      </a> para compartir tu experiencia.
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de reseñas */}
              <div id="reviews-list">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Cargando reseñas...</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando reseñas...</p>
                  </div>
                ) : !apiReviews || apiReviews.length === 0 ? (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">No hay reseñas aún</h5>
                      <p className="text-muted">
                        ¡Sé el primero en compartir tu experiencia en esta cafetería!
                      </p>
                      {!isUser && (
                        <a href="/login" className="btn btn-outline-primary">
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Iniciar sesión para reseñar
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    {apiReviews.map((review, index) => (
                      <div key={review.id || index} className="col-12 mb-4">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="d-flex align-items-center">
                                <div className="me-3">
                                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '40px', height: '40px' }}>
                                    <i className="fas fa-user text-white"></i>
                                  </div>
                                </div>
                                <div>
                                  <h6 className="mb-1" style={{ color: "#8B4513" }}>
                                    {review.user?.username || `Usuario ${index + 1}`}
                                  </h6>
                                  <div className="d-flex align-items-center">
                                    {renderStars(review.points)}
                                    <span className="ms-2 fw-bold text-warning">
                                      {review.points}/5
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <small className="text-muted">
                                <i className="fas fa-calendar-alt me-1"></i>
                                {formatDate(review.created_at)}
                              </small>
                            </div>

                            {/* Contenido de la reseña */}
                            <div className="ms-5">
                              <p className="mb-0" style={{ lineHeight: '1.6' }}>
                                "{review.description}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Estadísticas de reseñas */}
              {apiReviews && apiReviews.length > 0 && (
                <div className="card border-0 shadow-sm mt-4">
                  <div className="card-header" style={{ backgroundColor: "#8B4513", color: "white" }}>
                    <h6 className="mb-0">
                      <i className="fas fa-chart-bar me-2"></i>
                      Distribución de Calificaciones
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="text-center">
                          <div className="display-4 text-warning">⭐</div>
                          <div className="h2">
                            {apiReviews.length > 0
                              ? (apiReviews.reduce((sum, review) => sum + (review.points || 0), 0) / apiReviews.length).toFixed(1)
                              : '0.0'
                            }
                          </div>
                          <div className="text-muted">
                            Promedio de {apiReviews.length} reseña{apiReviews.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        {[5, 4, 3, 2, 1].map(stars => {
                          const count = apiReviews.filter(review => Math.floor(review.points || 0) === stars).length;
                          const percentage = apiReviews.length > 0 ? (count / apiReviews.length) * 100 : 0;

                          return (
                            <div key={stars} className="d-flex align-items-center mb-2">
                              <span className="me-2" style={{ minWidth: '60px' }}>
                                {stars} ⭐
                              </span>
                              <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                                <div
                                  className="progress-bar"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: '#8B4513'
                                  }}
                                ></div>
                              </div>
                              <small className="text-muted" style={{ minWidth: '40px' }}>
                                {count}
                              </small>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CafeDetail;