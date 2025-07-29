import React, { useEffect, useState } from 'react';
import { favoriteGet, favoriteDelete, favoriteCreate } from '../services/api_favorite.js';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import ImageNotFound from "../assets/img/image-not-found.png"  

const CafeteriaCard = ({ cafeteria, onSelect }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { dispatch, store } = useGlobalReducer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [disableFavorite, setDisableFavorite] = useState(false);
  const [categories, setCategories] = useState([]);

  // Mapeo de categorías a iconos y colores
  const categoryConfig = {
    'WiFi': { icon: 'fas fa-wifi', color: 'bg-primary' },
    'Pet Friendly': { icon: 'fas fa-dog', color: 'bg-success' },
    'Sin TACC': { icon: 'fas fa-leaf', color: 'bg-warning' },
    'Zona Fumadores': { icon: 'fas fa-smoking', color: 'bg-secondary' },
    'Zona Fumadores lokos': { icon: 'fas fa-smoking', color: 'bg-secondary' },
    'Espacios azules': { icon: 'fas fa-heart', color: 'bg-info' },
    'Espacios Azules': { icon: 'fas fa-heart', color: 'bg-info' }
  };

  const isMyFavorite = () => {
    const localFavorites = localStorage.getItem("favorites") && localStorage.getItem("favorites") !== undefined ?
      JSON.parse(localStorage.getItem("favorites")) : store.favorites ?
        JSON.parse(store.favorites) : []

    const isInFavorites = localFavorites?.some(store => store.id === cafeteria.id);
    console.log("isInFavorites", isInFavorites)
    if (isInFavorites) {
      setIsFavorite(true)
      console.log('Es Favorito');
    } else {
      setIsFavorite(false)
      console.log('No es Favorito');
    }
  };

  // Obtener las categorías activas para esta cafetería
  const getActiveCategoriesForStore = () => {
    if (!categories.length || !cafeteria.categories) return [];

    return categories.filter(category =>
      cafeteria.categories.some(storeCategory => storeCategory.id === category.id)
    );
  };

  const toggleFavorite = async () => {
    const form = {
      "store_id": cafeteria?.id
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
  }

  useEffect(() => {
    if (store?.role === "User") {
      isMyFavorite();
      setDisableFavorite(false);
    } else {
      setDisableFavorite(true);
    }
  }, [store.role]);

  const activeCategories = getActiveCategoriesForStore();

  return (
    <div className="col">
      <div
        className="card h-100 shadow-sm border-0"
        style={{ transition: "transform 0.3s" }}
      >
        <div className="position-relative">
          {/* Botón de favorito */}
          <button
            className="btn btn-light position-absolute top-0 start-0 m-2 p-1 rounded-circle z-3"
            onClick={toggleFavorite}
            disabled={disableFavorite}
            style={{ width: '36px', height: '36px' }}
          >
            <i className={isFavorite ? "fas fa-heart text-danger" : "far fa-heart"}></i>
          </button>

          {/* Imagen */}
          <img
            src={
              cafeteria.images?.[0]?.url ||
              cafeteria.image_url ||
              ImageNotFound
            }
            alt={cafeteria.name}
            className="card-img-top"
            style={{ height: "200px", objectFit: "cover" }}
            onError={(e) => {
              e.target.src =
                 ImageNotFound ;
            }}
          />

          {/* Rating */}
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-white text-dark d-flex align-items-center">
              <i className="fas fa-star text-warning me-1"></i>
              {(cafeteria.total_points || 0).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="card-body">
          <h5 className="card-title fw-bold">{cafeteria.name}</h5>
          <div className="d-flex align-items-center text-muted mb-2">
            <i className="fas fa-map-marker-alt me-1"></i>
            <small>{cafeteria.address || "Dirección no disponible"}</small>
          </div>
          {/* Tags de categorías en el cuerpo */}
          <div className="mb-3">
            {cafeteria.categories.slice(0, 4).map((category) => {
              const config = categoryConfig[category.name] || { icon: 'fas fa-tag', color: 'bg-light' };
              return (
                <span key={category.id} className="badge bg-light text-warning me-1 mb-1">
                  <i className={`${config.icon} me-1`}></i>
                  {category.name}
                </span>
              );
            })}
            {activeCategories.length > 4 && (
              <span className="badge bg-light text-muted me-1 mb-1">
                +{activeCategories.length - 4} más
              </span>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              {cafeteria.review_count || 0} reseñas
            </small>

            <button
              onClick={onSelect}
              className="btn btn-sm d-inline-flex align-items-center"
              style={{
                background: "linear-gradient(135deg, #7c2d12 0%, #d97706 100%)",
                color: "white",
                padding: "0.4rem 1.2rem",
                borderRadius: "50px",
                border: "none",
                boxShadow: "0 2px 8px rgba(124, 45, 18, 0.3)",
                transition: "all 0.3s",
                fontWeight: "500",
                fontSize: "0.875rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 45, 18, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 45, 18, 0.3)";
              }}
            >
              Visitar{' '}
              <i className="fas fa-arrow-right ms-2" style={{ fontSize: "0.75rem" }}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeteriaCard;