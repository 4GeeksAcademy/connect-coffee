import React, { useState, useEffect } from 'react';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { getStoreIndex, getStoreDetail } from '../services/api_store.js';
import CafeDetail from './CafeDetail.jsx';
import { getCategories } from '../services/api_category.js';

const StoreIndex = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCafeteria, setSelectedCafeteria] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [cafeterias, setCafeterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { store, dispatch } = useGlobalReducer();
  const [apiFilterOptions, setApiFilterOptions] = useState(null);

  useEffect(() => {
    loadCafeterias();
    getfilterOptions();
  }, []);

  const loadCafeterias = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando tiendas...');
      const response = await getStoreIndex();
      console.log('Respuesta de API TEST:', response);

      if (response && response.ok && response.data) {
        setCafeterias(response.data);
        console.log('Tiendas cargadas:', response.data);
      } else {
        const errorMsg = response?.msg || 'Error al cargar las cafeterías';
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

  const loadCafeteriaDetail = async (id) => {
    try {
      console.log('Cargando detalles de tienda:', id);
      const response = await getStoreDetail(id);
      console.log('Respuesta detalle:', response);

      if (response && response.ok && response.data) {
        setSelectedCafeteria(response.data);
        setCurrentView('detail');
        console.log('Cafetería detallada:', response.data);
      }
    } catch (err) {
      console.error('Error cargando detalle:', err);
    }
  };

  const getfilterOptions = async () => {
    setApiFilterOptions(await getCategories())
  };

  const filterOptions = [
    { id: 'has_wifi', label: 'WiFi', icon: 'fas fa-wifi' },
    { id: 'pet_friendly', label: 'Pet Friendly', icon: 'fas fa-dog' },
    { id: 'gluten_free', label: 'Sin TACC', icon: 'fas fa-leaf' },
    { id: 'smoking_area', label: 'Zona Fumadores', icon: 'fas fa-smoking' },
    { id: 'quiet_space', label: 'Espacios Azules', icon: 'fas fa-heart' }
  ];

  // filtros ** //
  const filteredCafeterias = cafeterias.filter(cafe => {
    const matchesSearch =
      cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cafe.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cafe.description && cafe.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilters = selectedFilters.length === 0 ||
      selectedFilters.every(filter => cafe[filter] === true);

    return matchesSearch && matchesFilters;
  });

  const toggleFilter = (filterId) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  {/* Header */ }
  const SearchAndFilters = () => (
    <div className="bg-light py-5" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)' }}>
      <div className="container">
        {/* Hero Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold" style={{ color: '#78350f' }}>
            Encuentra tu Café Perfecto
          </h1>
          <p className="lead" style={{ color: '#78350f' }}>
            Descubre cafeterías increíbles cerca de ti y conecta con la comunidad cafetera
          </p>
        </div>

        {/* Barra de busqueda */}
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

        {/* Filtros */}
        <div className="d-flex align-items-center justify-content-center mb-5 gap-3 flex-wrap">
          <span className="badge text-dark d-flex align-items-center me-2">
            <i className="fas fa-filter me-1"></i>
            Filtros:
          </span>
          {apiFilterOptions && (
            filterOptions.map((filter) => {
              const isSelected = selectedFilters.includes(filter.id);
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`btn px-3 py-2 ${isSelected
                    ? 'btn-warning text-white'
                    : 'btn-outline-warning'
                    }`}
                >
                  <i className={`${filter.icon} me-1`}></i>
                  {filter.label}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  {/* Cafeterias Grid */ }
  const CafeteriaCard = ({ cafeteria, onSelect }) => (
    <div className="col">
      <div className="card h-100 shadow-sm border-0" style={{ transition: 'transform 0.3s' }}>
        <div className="position-relative">
          <img
            src={cafeteria.image_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop"}
            alt={cafeteria.name}
            className="card-img-top"
            style={{ height: '200px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop";
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
          <p className="card-text text-muted small">
            {cafeteria.description || "Cafetería acogedora con excelente ambiente"}
          </p>

          {/* Label o tag */}
          <div className="mb-3">
            {cafeteria.has_wifi && (
              <span className="badge bg-light text-warning me-1 mb-1">
                <i className="fas fa-wifi me-1"></i>WiFi
              </span>
            )}
            {cafeteria.pet_friendly && (
              <span className="badge bg-light text-warning me-1 mb-1">
                <i className="fas fa-dog me-1"></i>Pet Friendly
              </span>
            )}
            {cafeteria.gluten_free && (
              <span className="badge bg-light text-warning me-1 mb-1">
                <i className="fas fa-leaf me-1"></i>Sin TACC
              </span>
            )}
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">{cafeteria.review_count || 0} reseñas</small>
            <button
              onClick={onSelect}
              className="btn btn-warning btn-sm"
            >
              Visitar <i className="fas fa-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const HomePage = () => (
    <div style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)', minHeight: '100vh' }}>
      <SearchAndFilters />
      <div className="container py-5">
        <div className="mb-4">
          <h2 className="fw-bold mb-2" style={{ color: '#78350f' }}>Descubre Cafeterías Increíbles</h2>
          <p className="lead" style={{ color: '#78350f' }}>
            {filteredCafeterias.length} cafetería{filteredCafeterias.length !== 1 ? 's' : ''} encontrada{filteredCafeterias.length !== 1 ? 's' : ''}
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
                ? 'No hay cafeterías registradas en la base de datos'
                : 'Intenta con otros filtros o términos de búsqueda'
              }
            </p>
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)' }}>
      {currentView === 'home' && <HomePage />}
      {currentView === 'detail' && selectedCafeteria && (
        <CafeDetail
          cafeData={selectedCafeteria}
          onBack={() => {
            setCurrentView('home');
            setSelectedCafeteria(null);
          }}
        />
      )}
    </div>
  );
};

export default StoreIndex;