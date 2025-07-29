import React, { useState, useEffect, useMemo, useCallback } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import CafeDetail from "./CafeDetail.jsx";
import { getStoreIndex, getStoreDetail } from "../services/api_store.js";
import { favoriteGet, favoriteDelete, favoriteCreate } from '../services/api_favorite.js';
import CafeteriaCard from "./CafeteriaCard.jsx";
import { getCategories } from "../services/api_category.js";
import "../styles/StoreIndex.css";

const StoreIndex = () => {
  const [currentView, setCurrentView] = useState("home");
  const [selectedCafeteria, setSelectedCafeteria] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [cafeterias, setCafeterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store, dispatch } = useGlobalReducer();
  const [apiFilterOptions, setApiFilterOptions] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const categoryIconMap = {
    'WiFi': 'fas fa-wifi',
    'Pet Friendly': 'fas fa-dog',
    'Sin TACC': 'fas fa-leaf',
    'Zona Fumadores': 'fas fa-smoking',
    'Zona Fumadores lokos': 'fas fa-smoking',
    'Espacios azules': 'fas fa-heart',
    'Espacios Azules': 'fas fa-heart'
  };

  useEffect(() => {
    loadCafeterias();
    getfilterOptions();
  }, []);

  useEffect(() => {
    if (store?.role === 'User') {
      loadFavorite();
    }
  }, [store.role]);

  const loadCafeterias = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Cargando tiendas...");
      const response = await getStoreIndex();
      console.log("Respuesta de API TEST:", response);

      if (response && response.ok && response.data) {
        setCafeterias(response.data);
        console.log("Tiendas cargadas:", response.data);
      } else {
        const errorMsg = response?.msg || "Error al cargar las cafeterías";
        console.error("Error en respuesta:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError("Error de conexión: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCafeteriaDetail = async (id) => {
    try {
      console.log("Cargando detalles de tienda:", id);
      const response = await getStoreDetail(id);
      console.log("Respuesta detalle:", response);

      if (response && response.ok && response.data) {
        setSelectedCafeteria(response.data);
        setCurrentView("detail");
        console.log("Cafetería detallada:", response.data);
      }
    } catch (err) {
      console.error("Error cargando detalle:", err);
    }
  };

  const loadFavorite = async () => {
    if (store?.role === "User") {
      try {
        setFavoritesLoading(true);
        setError(null);
        console.log('Cargando favoritos...');
        const response = await favoriteGet(store.token);
        console.log('Respuesta de API FAV:', response);
        setIsFavorite(true);
        console.log('Es Favorito ------------ rompo', response?.data);
        localStorage.setItem("favorites", JSON.stringify(response?.data || []));
        dispatch({ type: "favorites", payload: JSON.stringify(response?.data || []) });
      } catch (err) {
        console.error('Error de conexión:', err);
        setError('Error de conexión: ' + err.message);
      } finally {
        setFavoritesLoading(false);
      }
    }
  };

  const getfilterOptions = async () => {
    try {
      const cats = await getCategories();
      console.log("Categorías para filtros:", cats);
      const filterOptions = Array.isArray(cats) ? cats.map(category => ({
        id: category.id,
        name: category.name,
        label: category.name,
        icon: categoryIconMap[category.name] || 'fas fa-tag'
      })) : [];

      setApiFilterOptions(filterOptions);
    } catch (err) {
      console.error("Error cargando categorías:", err);
      setApiFilterOptions([]);
    }
  };

  // Implementacion filter useMemo test ** //
  const filteredCafeterias = useMemo(() => {
    if (!searchTerm && selectedFilters.length === 0) {
      return cafeterias;
    }

    const searchLower = searchTerm.toLowerCase();

    return cafeterias.filter((cafe) => {
      const matchesSearch = !searchTerm || (
        cafe.name.toLowerCase().includes(searchLower) ||
        cafe.address.toLowerCase().includes(searchLower) ||
        (cafe.description && cafe.description.toLowerCase().includes(searchLower))
      );
      const matchesFilters = selectedFilters.length === 0 ||
        selectedFilters.every(filterId => {
          return cafe.categories && cafe.categories.some(category =>
            category.id === parseInt(filterId)
          );
        });

      return matchesSearch && matchesFilters;
    });
  }, [cafeterias, searchTerm, selectedFilters]);
  const toggleFilter = useCallback((filterId) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  }, []);
  const SearchAndFilters = React.memo(() => (
    <div
      className="bg-light py-5"
      style={{ background: "linear-gradient( #fff5eb)" }}
    >
      <div className="container">
        {/* Hero Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold" style={{ color: "#78350f" }}>
            Encuentra tu Café Perfecto
          </h1>
          <p className="lead" style={{ color: "#78350f" }}>
            Descubre cafeterías increíbles cerca de ti y conecta con la
            comunidad cafetera
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-8 col-lg-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Buscar cafeterías o ubicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filtros dinámicos */}
        <div className="d-flex align-items-center justify-content-center mb-5 gap-3 flex-wrap">
          <span className="badge text-dark d-flex align-items-center me-2">
            <i className="fas fa-filter me-1"></i>
            Filtros:
          </span>
          {apiFilterOptions.map((filter) => {
            const isSelected = selectedFilters.includes(filter.id.toString());
            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id.toString())}
                className={`btn px-3 py-2 ${isSelected
                    ? "btn-filter-active"
                    : "btn-filter-inactive"
                  }`}
                style={{
                  backgroundColor: isSelected ? '#7c2d12' : 'white',
                  color: isSelected ? 'white' : '#7c2d12',
                  border: '2px solid #7c2d12',
                  borderRadius: '25px',
                  transition: 'all 0.3s ease',
                  fontWeight: '500'
                }}
              >
                <i className={`${filter.icon} me-1`}></i>
                {filter.label}
              </button>
            );
          })}

          {/* Botón para limpiar filtros */}
          {selectedFilters.length > 0 && (
            <button
              onClick={() => setSelectedFilters([])}
              className="btn btn-outline-secondary px-3 py-2"
              style={{ borderRadius: '25px' }}
            >
              <i className="fas fa-times me-1"></i>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Indicador de filtros activos */}
        {selectedFilters.length > 0 && (
          <div className="text-center mb-3">
            <small className="text-muted">
              Filtrando por: {selectedFilters.length} categoría{selectedFilters.length !== 1 ? 's' : ''}
            </small>
          </div>
        )}
      </div>
    </div>
  ));

  const HomePage = () => (
    <div
      style={{ background: "linear-gradient( #fff5eb)", minHeight: "100vh" }}
    >
      <SearchAndFilters />
      <div className="container py-5">
        <div className="mb-4">
          <h2 className="fw-bold mb-2" style={{ color: "#78350f" }}>
            Descubre Cafeterías Increíbles
          </h2>
          <p className="lead" style={{ color: "#78350f" }}>
            {filteredCafeterias.length} cafetería
            {filteredCafeterias.length !== 1 ? "s" : ""} encontrada
            {filteredCafeterias.length !== 1 ? "s" : ""}
            {selectedFilters.length > 0 && (
              <span className="text-muted">
                {" "}(con filtros aplicados)
              </span>
            )}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted">Cargando cafeterías desde API...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Error:</strong> {error}
            <br />
            <button className="btn btn-warning mt-2" onClick={loadCafeterias}>
              <i className="fas fa-redo me-1"></i>
              Reintentar
            </button>
          </div>
        ) : filteredCafeterias.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-coffee fa-4x text-muted mb-3"></i>
            <h3 className="text-muted">No encontramos cafeterías</h3>
            <p className="text-muted">
              {cafeterias.length === 0
                ? "No hay cafeterías registradas en la base de datos"
                : selectedFilters.length > 0 || searchTerm
                  ? "No hay cafeterías que coincidan con tu búsqueda o filtros"
                  : "Intenta con otros filtros o términos de búsqueda"}
            </p>
            {(selectedFilters.length > 0 || searchTerm) && (
              <div className="mt-3">
                <button
                  className="btn btn-outline-warning me-2"
                  onClick={() => {
                    setSelectedFilters([]);
                    setSearchTerm("");
                  }}
                >
                  <i className="fas fa-times me-1"></i>
                  Limpiar búsqueda y filtros
                </button>
              </div>
            )}
            {cafeterias.length === 0 && (
              <button className="btn btn-warning mt-2" onClick={loadCafeterias}>
                <i className="fas fa-redo me-1"></i>
                Recargar
              </button>
            )}
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {filteredCafeterias.map((cafeteria) => (
              <CafeteriaCard
                key={cafeteria.id}
                cafeteria={cafeteria}
                onSelect={() => loadCafeteriaDetail(cafeteria.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)",
      }}
    >
      {currentView === "home" && <HomePage />}
      {currentView === "detail" && selectedCafeteria && (
        <CafeDetail
          cafeData={selectedCafeteria}
          onBack={() => {
            setCurrentView("home");
            setSelectedCafeteria(null);
          }}
        />
      )}
    </div>
  );
};

export default StoreIndex;