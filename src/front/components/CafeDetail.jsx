import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { getStoreMenu, getFrontStoreMenu } from '../services/api_menu.js';
import { getFrontStorePoints } from '../services/api_userpoints.js'
import ReviewForm from './ReviewForm.jsx';
import { favoriteGet, favoriteDelete, favoriteCreate } from '../services/api_favorite.js'
import ImageNotFound from "../assets/img/image-not-found.png"

const CafeDetail = ({ cafeData, onBack }) => {
  const { store, dispatch } = useGlobalReducer();
  const [activeTab, setActiveTab] = useState('info');
  const [isFavorite, setIsFavorite] = useState(false);
  const [menuData, setMenuData] = useState({});
  const [apiReviews, setApiReviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUser, setIsUser] = useState(false);
  const [disableFavorite, setDisableFavorite] = useState(false);

  // Cargar menú desde la API cuando se monta el componente ** //
  useEffect(() => {
    if (cafeData?.id && store.token) {
      loadMenuFromAPI();
    }
  }, [cafeData?.id, store.token]);
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

  const loadMenuFromAPI = async () => {
    try {
      setLoading(true);
      console.log("Cargando menú para tienda:", cafeData.id);

      const response = await getFrontStoreMenu(cafeData?.id);
      console.log('Respuesta menú:', response);

      if (response && response.ok && response.data) {
        // Filtrar menú por store_id ** //
        const storeMenu = response.data.filter(
          (item) => item.store_id === cafeData.id
        );
        const groupedMenu = storeMenu.reduce((acc, item) => {
          const category = item.category || "Sin categoría";
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description || "Descripción no disponible",
          });
          return acc;
        }, {});

        setMenuData(groupedMenu);
        console.log('Menú cargado:', groupedMenu);
      }
    } catch (error) {
      console.error('Error cargando menú:', error);
    } finally {
      setLoading(false);
    }
  };
  const loadApiReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando reseñas...');
      const response = await getFrontStorePoints(cafeData?.id);
      console.log('Respuesta de API TEST:', response);
      
      if (response && response.ok && response.data) {
        setApiReviews(response.data);
        console.log('Tiendas reseñas:', response.data);
        setIsUser(true);
      } else {
        const errorMsg = response?.msg || 'Error al cargar las reseñas';
        console.error('Error en respuesta:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  const reloadReviews = async () => {
    try {
      console.log('🔄 Recargando reseñas...');
      const response = await getFrontStorePoints(cafeData?.id);

      if (response && response.ok && response.data) {
        setApiReviews(response.data);
        console.log('✅ Reseñas recargadas:', response.data.length);
      }
    } catch (err) {
      console.error('❌ Error recargando reseñas:', err);
    }
  };
  const handleReviewSubmitted = (response) => {
    console.log('Nueva reseña enviada:', response);
    reloadReviews();
    setTimeout(() => {
      document.getElementById('reviews-list')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 1000);
  };
  //const apiReviews = getStorePoints(store.token)
  const loadFavorite = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando favoritos...');
      const response = await favoriteGet(store.token);
      console.log('Respuesta de API FAV:', response);

      if (response && response.ok && response.data) {
        const isInFavorites = response.data.some(store => store.id === cafeData?.id);
        if (isInFavorites) {
          setIsFavorite(true)
          console.log('Es Favorito');
        }
      } else {
        const errorMsg = response?.msg || 'Error al cargar las reseñas';
        console.error('Error en respuesta:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error de conexión:', err);
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
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };
  // Llamar a rating ** //
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

    // TODO: Si alcanza el tiempo implementar fav agregar/quitar ** //
  };

  const renderHours = () => {
    if (!cafeData.hours_detail && !cafeData.hours) {
      return (
        <div className="d-flex justify-content-between py-2 border-bottom">
          <span className="fw-semibold">Horario</span>
          <span>Consultar horarios</span>
        </div>
      );
    }

    const hours = cafeData.hours_detail || cafeData.hours;

    if (typeof hours === "string") {
      return (
        <div className="d-flex justify-content-between py-2 border-bottom">
          <span className="fw-semibold">Horario general</span>
          <span>{hours}</span>
        </div>
      );
    }

    return Object.entries(hours).map(([day, time]) => (
      <div
        key={day}
        className="d-flex justify-content-between py-2 border-bottom"
      >
        <span className="fw-semibold">{day}</span>
        <span>{time}</span>
      </div>
    ));
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

  // Validacion de datos ** //
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
        {/* BOTON DE VOLVER CON ESTILO INCLUIDO*/}
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
              e.currentTarget.style.transform = "translateX(-4px)"; // Efecto hacia la izquierda
              e.currentTarget.style.boxShadow =
                "0 4px 8px rgba(124, 45, 18, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.9)";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 2px 6px rgba(124, 45, 18, 0.1)";
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
                  e.target.src = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=400&fit=crop";
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
                        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop"
                      }
                      alt="Logo"
                      className="rounded-circle me-3"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop";
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
                          ({cafeData.review_count || 0} reseñas)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted mb-3">
                    {cafeData.description ||
                      "Cafetería acogedora con excelente ambiente"}
                  </p>

                  <div className="mb-3">
                    <span
                      className={`badge px-3 py-2 ${cafeData.is_open ? "bg-success" : "bg-danger"
                        }`}
                    >
                      {cafeData.is_open ? "🟢 Abierto ahora" : "🔴 Cerrado"}
                    </span>
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
              { id: 'info', label: 'Información', icon: '📍' },
              { id: 'menu', label: 'Menú', icon: '📋' },
              { id: 'photos', label: 'Fotos', icon: '📸' },
              { id: 'reviews', label: 'Reseñas', icon: 'ℹ️' }
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
            <div className="col-md-6 mb-4">
              <div className="card border-0 shadow-sm">
                <div
                  className="card-header"
                  style={{ backgroundColor: "#8B4513", color: "white" }}
                >
                  <h5 className="mb-0">📍 Ubicación</h5>
                </div>
                <div className="card-body">
                  <p className="mb-2">
                    <strong>Dirección:</strong>{" "}
                    {cafeData.address || "Dirección no disponible"}
                  </p>
                  <div className="mt-3">
                    <div
                      className="bg-light rounded p-4 text-center"
                      style={{ minHeight: "200px" }}
                    >
                      <p className="text-muted">🗺️ Mapa interactivo</p>
                      <small className="text-muted">
                        {cafeData.location?.coordinates ? (
                          <>
                            Lat: {cafeData.location.coordinates.lat}
                            <br />
                            Lng: {cafeData.location.coordinates.lng}
                          </>
                        ) : (
                          "Coordenadas no disponibles"
                        )}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card border-0 shadow-sm">
                <div
                  className="card-header"
                  style={{ backgroundColor: "#8B4513", color: "white" }}
                >
                  <h5 className="mb-0">🕒 Horarios</h5>
                </div>
                <div className="card-body">{renderHours()}</div>
              </div>

              <div className="card border-0 shadow-sm mt-4">
                <div
                  className="card-header"
                  style={{ backgroundColor: "#8B4513", color: "white" }}
                >
                  <h5 className="mb-0">📞 Contacto</h5>
                </div>
                <div className="card-body">
                  <p className="mb-2">
                    <strong>Teléfono:</strong>{" "}
                    {cafeData.phone || "Teléfono no disponible"}
                  </p>
                  <p className="mb-2">
                    <strong>Email:</strong>{" "}
                    {cafeData.email || "Email no disponible"}
                  </p>
                  <p className="mb-0">
                    <strong>Web:</strong>{" "}
                    {cafeData.website || "Sitio web no disponible"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="row">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Cargando menú...</span>
                </div>
                <p className="mt-3 text-muted">Cargando menú API TEST...</p>
              </div>
            ) : cafeData.menu && cafeData.menu.length > 0 ? (
              // Verificar menu desde el back ** //
              cafeData.menu.map((menuSection) => (
                <div key={menuSection.id} className="col-12 mb-4">
                  <h4 className="mb-3" style={{ color: "#8B4513" }}>
                    {menuSection.name}
                  </h4>
                  <div className="row">
                    {menuSection.categories?.map((category) => (
                      <div key={category.id} className="col-lg-6 mb-4">
                        <div className="card border-0 shadow-sm">
                          <div
                            className="card-header"
                            style={{
                              backgroundColor: "#8B4513",
                              color: "white",
                            }}
                          >
                            <h5 className="mb-0">{category.name}</h5>
                          </div>
                          <div className="card-body">
                            {category.products?.map((item) => (
                              <div
                                key={item.id}
                                className="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom"
                              >
                                <div className="flex-grow-1">
                                  <h6
                                    className="mb-1"
                                    style={{ color: "#8B4513" }}
                                  >
                                    {item.name}
                                  </h6>
                                  <p className="text-muted small mb-0">
                                    {item.description}
                                  </p>
                                </div>
                                <span
                                  className="fw-bold ms-3"
                                  style={{ color: "#8B4513" }}
                                >
                                  {item.price
                                    ? formatCurrency(item.price)
                                    : "Consultar"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : Object.keys(menuData).length > 0 ? (
              // El menu viene del back ** hacer llamada //
              Object.entries(menuData).map(([category, items]) => (
                <div key={category} className="col-lg-6 mb-4">
                  <div className="card border-0 shadow-sm">
                    <div
                      className="card-header"
                      style={{ backgroundColor: "#8B4513", color: "white" }}
                    >
                      <h5 className="mb-0">{category}</h5>
                    </div>
                    <div className="card-body">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom"
                        >
                          <div className="flex-grow-1">
                            <h6 className="mb-1" style={{ color: "#8B4513" }}>
                              {item.name}
                            </h6>
                            <p className="text-muted small mb-0">
                              {item.description}
                            </p>
                          </div>
                          <span
                            className="fw-bold ms-3"
                            style={{ color: "#8B4513" }}
                          >
                            {item.price
                              ? formatCurrency(item.price)
                              : "Consultar"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">Menú no disponible</h5>
                <p className="text-muted">
                  Esta cafetería aún no ha subido su menú
                </p>
                {!store.token && (
                  <p className="text-muted small">
                    <i className="fas fa-info-circle me-1"></i>
                    Inicia sesión para ver más detalles
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="row">
            {cafeData.images && cafeData.images.length > 0 ? (
              cafeData.images.map((image, index) => (
                <div key={index} className="col-md-4 mb-4">
                  <div className="card border-0 shadow-sm">
                    <img
                      src={typeof image === 'string' ? image : image.url}
                      className="card-img-top"
                      alt={`${cafeData.name} - Foto ${index + 1}`}
                      style={{ height: '250px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=250&fit=crop";
                      }}
                    />
                  </div>
                </div>
              ))
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

                {/* ✅ Formulario de reseña mejorado */}
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

              {/* ✅ Lista de reseñas mejorada */}
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
                            <div className="row">
                              <div className="col-md-12">
                                {/* Header de la reseña */}
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ✅ Estadísticas de reseñas */}
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
