import React, { useState, useEffect } from 'react';

const StoreIndex = () => {
  const [cafeterias, setCafeterias] = useState([]);

  // Datos básicos
  const mockCafeterias = [
    {
      id: 1,
      name: "Brew & Co",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
      rating: 4.8,
      location: "Providencia, Santiago"
    },
    {
      id: 2,
      name: "Coffee Culture",
      image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400",
      rating: 4.7,
      location: "Ñuñoa, Santiago"
    },
    {
      id: 3,
      name: "The Bean House",
      image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
      rating: 4.6,
      location: "La Reina, Santiago"
    },
    {
      id: 4,
      name: "Café Aroma",
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
      rating: 4.5,
      location: "Centro, Santiago"
    },
    {
      id: 5,
      name: "Verde Café",
      image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/d7/25/5b/20190818-130608-largejpg.jpg?w=1000&h=-1&s=1",
      rating: 4.3,
      location: "Las Condes, Santiago"
    },
    {
      id: 6,
      name: "Café Ritual",
      image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400",
      rating: 4.2,
      location: "Vitacura, Santiago"
    }
  ];

  // Cargar datos
  useEffect(() => {
    setCafeterias(mockCafeterias);
  }, []);

  // conectar con otros componentes
  const handleCafeteriaClick = (cafeteria) => {
    console.log('Cafetería seleccionada:', cafeteria);
    // LLamar otros comp
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#F6E0C4', minHeight: '100vh' }}>
      {/* Título */}
      <h1 style={{ textAlign: 'center', color: '#78350f', marginBottom: '30px' }}>
        Descubre Cafeterías Increíbles
      </h1>
      <p style={{ textAlign: 'center', color: '#78350f', marginBottom: '30px' }}>Encuentra el lugar perfecto para tu próximo café</p>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {cafeterias.map((cafeteria) => (
          <div
            key={cafeteria.id}
            onClick={() => handleCafeteriaClick(cafeteria)}
            style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {/* Imagen */}
            <img
              src={cafeteria.image}
              alt={cafeteria.name}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />

            {/* Información básica */}
            <div style={{ padding: '15px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#78350f' }}>
                {cafeteria.name}
              </h3>
              <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>
                📍 {cafeteria.location}
              </p>
              <p style={{ margin: '0', color: '#f97316', fontWeight: 'bold' }}>
                ⭐ {cafeteria.rating}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreIndex;