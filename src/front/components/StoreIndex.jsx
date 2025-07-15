import React, { useState, useEffect } from 'react';

const StoreIndex = () => {
  const [cafeterias, setCafeterias] = useState([]);
  const [filteredCafeterias, setFilteredCafeterias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    wifi: false,
    petFriendly: false,
    sinTacc: false,
    zonaFumadores: false,
    espaciosTranquilos: false
  });

  const mockCafeterias = [
    {
      id: 1,
      name: "Brew & Co",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
      rating: 4.8,
      location: "Providencia, Santiago",
      tags: ["wifi", "petFriendly", "espaciosTranquilos"]
    },
    {
      id: 2,
      name: "Coffee Culture",
      image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400",
      rating: 4.7,
      location: "Ñuñoa, Santiago",
      tags: ["wifi", "sinTacc", "zonaFumadores"]
    },
    {
      id: 3,
      name: "The Bean House",
      image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
      rating: 4.6,
      location: "La Reina, Santiago",
      tags: ["wifi", "espaciosTranquilos", "petFriendly"]
    },
    {
      id: 4,
      name: "Café Aroma",
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
      rating: 4.5,
      location: "Centro, Santiago",
      tags: ["wifi", "sinTacc"]
    },
    {
      id: 5,
      name: "Verde Café",
      image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/d7/25/5b/20190818-130608-largejpg.jpg?w=1000&h=-1&s=1",
      rating: 4.3,
      location: "Las Condes, Santiago",
      tags: ["wifi", "petFriendly", "zonaFumadores", "espaciosTranquilos"]
    },
    {
      id: 6,
      name: "Café Ritual",
      image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400",
      rating: 4.2,
      location: "Vitacura, Santiago",
      tags: ["wifi", "sinTacc", "espaciosTranquilos"]
    }
  ];

  const filterConfig = {
    wifi: { icon: '📶', label: 'WiFi', color: 'primary' },
    petFriendly: { icon: '🐕', label: 'Pet Friendly', color: 'success' },
    sinTacc: { icon: '🚫', label: 'Sin TACC', color: 'warning' },
    zonaFumadores: { icon: '🚬', label: 'Zona Fumadores', color: 'secondary' },
    espaciosTranquilos: { icon: '💙', label: 'Espacios Tranquilos', color: 'info' }
  };

  useEffect(() => {
    setCafeterias(mockCafeterias);
    setFilteredCafeterias(mockCafeterias);
  }, []);

  useEffect(() => {
    let filtered = cafeterias;

    if (searchTerm) {
      filtered = filtered.filter(cafeteria =>
        cafeteria.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cafeteria.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const activeFilterKeys = Object.keys(activeFilters).filter(key => activeFilters[key]);
    if (activeFilterKeys.length > 0) {
      filtered = filtered.filter(cafeteria =>
        activeFilterKeys.some(filter => cafeteria.tags.includes(filter))
      );
    }

    setFilteredCafeterias(filtered);
  }, [searchTerm, activeFilters, cafeterias]);

  const toggleFilter = (filterKey) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      wifi: false,
      petFriendly: false,
      sinTacc: false,
      zonaFumadores: false,
      espaciosTranquilos: false
    });
    setSearchTerm('');
  };

  const handleCafeteriaClick = (cafeteria) => {
    console.log('Cafetería seleccionada:', cafeteria);
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#F6E0C4' }}>
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold" style={{ color: '#78350f' }}>
            Descubre Cafeterías Increíbles
          </h1>
          <p className="lead" style={{ color: '#78350f' }}>
            Encuentra el lugar perfecto para tu próximo café
          </p>
        </div>

        {/* Barra de busqueda */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-8 col-lg-6">
            <div className="input-group input-group-lg">
              <input
                type="text"
                className="form-control rounded-pill"
                placeholder="Buscar cafeterías o ubicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="input-group-text bg-transparent border-0 position-absolute end-0 top-50 translate-middle-y me-3" style={{ zIndex: 5 }}>
                🔍
              </span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="d-flex align-items-center justify-content-center mb-5 gap-3 flex-wrap">
          <div className="d-flex align-items-center me-3">
            <span className="me-2" style={{ color: '#8B4513' }}>🔧</span>
            <span className="fw-semibold" style={{ color: '#8B4513' }}>Filtros:</span>
          </div>

          {Object.entries(filterConfig).map(([key, config]) => (
            <button
              key={key}
              className="btn px-3 py-2"
              onClick={() => toggleFilter(key)}
              style={{
                backgroundColor: activeFilters[key] ? '#8B4513' : 'transparent',
                color: activeFilters[key] ? 'white' : '#8B4513',
                border: `1px solid #8B4513`,
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!activeFilters[key]) {
                  e.target.style.backgroundColor = 'rgba(139, 69, 19, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!activeFilters[key]) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="me-1">{config.icon}</span>
              {config.label}
            </button>
          ))}

          {Object.values(activeFilters).some(Boolean) && (
            <button
              className="btn btn-sm px-3 py-1 ms-2"
              style={{
                backgroundColor: 'transparent',
                color: '#8B4513',
                border: '1px solid #8B4513',
                borderRadius: '15px',
                fontSize: '12px'
              }}
              onClick={clearAllFilters}
            >
              ✖️ Limpiar
            </button>
          )}
        </div>

        {/* Resultados */}
        <div className="text-center mb-4">
          <h4 style={{ color: '#78350f' }}>
            {filteredCafeterias.length === 0 ? 'No se encontraron cafeterías' :
              `${filteredCafeterias.length} cafetería${filteredCafeterias.length !== 1 ? 's' : ''} encontrada${filteredCafeterias.length !== 1 ? 's' : ''}`}
          </h4>
        </div>

        {/* Cafeterias Grid */}
        {filteredCafeterias.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '4rem' }}>☕</div>
            <h4 style={{ color: '#78350f' }}>No se encontraron cafeterías</h4>
            <p style={{ color: '#78350f' }}>Prueba ajustando tus filtros o búsqueda</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredCafeterias.map((cafeteria) => (
              <div key={cafeteria.id} className="col-md-6 col-lg-4">
                <div
                  className="card h-100 shadow-sm border-0"
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => handleCafeteriaClick(cafeteria)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <img
                    src={cafeteria.image}
                    className="card-img-top"
                    alt={cafeteria.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title" style={{ color: '#78350f' }}>
                      {cafeteria.name}
                    </h5>
                    <p className="card-text text-muted mb-2">
                      📍 {cafeteria.location}
                    </p>
                    <div className="mb-3">
                      <span className="fw-bold text-warning">
                        ⭐ {cafeteria.rating}
                      </span>
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      {cafeteria.tags.map(tag => (
                        <span
                          key={tag}
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: '#F6E0C4',
                            color: '#78350f',
                            fontSize: '0.7rem'
                          }}
                        >
                          {filterConfig[tag]?.icon} {filterConfig[tag]?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreIndex;