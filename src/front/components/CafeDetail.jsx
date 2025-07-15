import React, { useState } from 'react';

const CafeDetail = () => {
    const [activeTab, setActiveTab] = useState('menu');
    const [isFavorite, setIsFavorite] = useState(false);

    // Mock data - vendría de props o API
    const cafeData = {
        id: 1,
        name: "Café Central",
        logo: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150",
        images: [
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
            "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800",
            "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800"
        ],
        rating: 4.5,
        reviewsCount: 124,
        description: "Ambiente acogedor con especialidad en café de origen y repostería artesanal. Ideal para trabajar o relajarse.",
        location: {
            address: "Av. Providencia 1234, Santiago",
            neighborhood: "Providencia",
            coordinates: { lat: -33.4372, lng: -70.6506 }
        },
        contact: {
            phone: "+56 2 2234 5678",
            email: "contacto@cafecentral.cl",
            website: "www.cafecentral.cl"
        },
        hours: {
            "Lunes - Viernes": "7:00 - 20:00",
            "Sábado - Domingo": "8:00 - 21:00"
        },
        tags: ["wifi", "petFriendly", "sinTacc"],
        isOpen: true,
        features: {
            wifi: "WiFi gratuito de alta velocidad",
            petFriendly: "Mascotas bienvenidas en terraza",
            sinTacc: "Opciones sin gluten disponibles",
            parking: "Estacionamiento disponible",
            terrace: "Terraza al aire libre"
        }
    };

    const menuData = {
        "Bebidas Calientes": [
            { id: 1, name: "Cappuccino", price: 3500, description: "Espresso con leche vaporizada y espuma" },
            { id: 2, name: "Latte", price: 3200, description: "Espresso suave con leche cremosa" },
            { id: 3, name: "Americano", price: 2800, description: "Espresso con agua caliente" },
            { id: 4, name: "Mocha", price: 4000, description: "Espresso con chocolate y leche" }
        ],
        "Bebidas Frías": [
            { id: 5, name: "Frappé", price: 4200, description: "Café helado con crema batida" },
            { id: 6, name: "Cold Brew", price: 3800, description: "Café de extracción en frío" },
            { id: 7, name: "Iced Latte", price: 3500, description: "Latte servido con hielo" }
        ],
        "Repostería": [
            { id: 8, name: "Croissant", price: 2800, description: "Croissant francés recién horneado" },
            { id: 9, name: "Muffin Arándanos", price: 3200, description: "Muffin casero con arándanos frescos" },
            { id: 10, name: "Cheesecake", price: 4500, description: "Porción de cheesecake de frambuesa" }
        ],
        "Desayunos": [
            { id: 11, name: "Tostadas Palta", price: 5200, description: "Pan integral con palta, tomate y huevo" },
            { id: 12, name: "Sandwich Jamón y Queso", price: 4800, description: "En pan brioche con jamón artesanal" },
            { id: 13, name: "Bowl Saludable", price: 6500, description: "Bowl con frutas y granola" }
        ]
    };

    const filterConfig = {
        wifi: { icon: '📶', label: 'WiFi' },
        petFriendly: { icon: '🐕', label: 'Pet Friendly' },
        sinTacc: { icon: '🚫', label: 'Sin TACC' }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < Math.floor(rating) ? 'text-warning' : 'text-muted'}>
                ★
            </span>
        ));
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#F6E0C4' }}>
            <div className="container py-4">
                {/* Botón Volver */}
                <div className="mb-4">
                    <button
                        className="btn px-3 py-2"
                        style={{
                            backgroundColor: 'transparent',
                            color: '#8B4513',
                            border: '1px solid #8B4513',
                            borderRadius: '20px'
                        }}
                        onClick={() => window.history.back()}
                    >
                        ← Volver a cafeterías
                    </button>
                </div>

                {/* Header con imagen principal */}
                <div className="card mb-4 border-0 shadow">
                    <div className="row g-0">
                        <div className="col-md-8">
                            <img
                                src={cafeData.images[0]}
                                className="img-fluid w-100"
                                alt={cafeData.name}
                                style={{ height: '400px', objectFit: 'cover' }}
                            />
                        </div>
                        <div className="col-md-4">
                            <div className="card-body h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div className="d-flex align-items-center mb-3">
                                        <img
                                            src={cafeData.logo}
                                            alt="Logo"
                                            className="rounded-circle me-3"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <h2 className="mb-1" style={{ color: '#8B4513' }}>{cafeData.name}</h2>
                                            <div className="d-flex align-items-center">
                                                {renderStars(cafeData.rating)}
                                                <span className="ms-2 fw-bold">{cafeData.rating}</span>
                                                <span className="ms-1 text-muted">({cafeData.reviewsCount} reseñas)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-muted mb-3">{cafeData.description}</p>

                                    <div className="mb-3">
                                        <span className={`badge px-3 py-2 ${cafeData.isOpen ? 'bg-success' : 'bg-danger'}`}>
                                            {cafeData.isOpen ? '🟢 Abierto ahora' : '🔴 Cerrado'}
                                        </span>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {cafeData.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="badge"
                                                style={{ backgroundColor: '#D2B48C', color: '#8B4513' }}
                                            >
                                                {filterConfig[tag]?.icon} {filterConfig[tag]?.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        className="btn flex-fill"
                                        style={{
                                            backgroundColor: '#8B4513',
                                            color: 'white',
                                            border: 'none'
                                        }}
                                        onClick={toggleFavorite}
                                    >
                                        {isFavorite ? '❤️ En Favoritos' : '🤍 Agregar a Favoritos'}
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
                            { id: 'info', label: 'Información', icon: '📍' },
                            { id: 'photos', label: 'Fotos', icon: '📸' }
                        ].map(tab => (
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
                {activeTab === 'menu' && (
                    <div className="row">
                        {Object.entries(menuData).map(([category, items]) => (
                            <div key={category} className="col-lg-6 mb-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header" style={{ backgroundColor: '#8B4513', color: 'white' }}>
                                        <h5 className="mb-0">{category}</h5>
                                    </div>
                                    <div className="card-body">
                                        {items.map(item => (
                                            <div key={item.id} className="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom">
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1" style={{ color: '#8B4513' }}>{item.name}</h6>
                                                    <p className="text-muted small mb-0">{item.description}</p>
                                                </div>
                                                <span className="fw-bold ms-3" style={{ color: '#8B4513' }}>
                                                    {formatCurrency(item.price)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header" style={{ backgroundColor: '#8B4513', color: 'white' }}>
                                    <h5 className="mb-0">📍 Ubicación</h5>
                                </div>
                                <div className="card-body">
                                    <p className="mb-2"><strong>Dirección:</strong> {cafeData.location.address}</p>
                                    <p className="mb-2"><strong>Barrio:</strong> {cafeData.location.neighborhood}</p>
                                    <div className="mt-3">
                                        <div
                                            className="bg-light rounded p-4 text-center"
                                            style={{ minHeight: '200px' }}
                                        >
                                            <p className="text-muted">🗺️ Mapa interactivo</p>
                                            <small className="text-muted">
                                                Lat: {cafeData.location.coordinates.lat}<br />
                                                Lng: {cafeData.location.coordinates.lng}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header" style={{ backgroundColor: '#8B4513', color: 'white' }}>
                                    <h5 className="mb-0">🕒 Horarios</h5>
                                </div>
                                <div className="card-body">
                                    {Object.entries(cafeData.hours).map(([day, hours]) => (
                                        <div key={day} className="d-flex justify-content-between py-2 border-bottom">
                                            <span className="fw-semibold">{day}</span>
                                            <span>{hours}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm mt-4">
                                <div className="card-header" style={{ backgroundColor: '#8B4513', color: 'white' }}>
                                    <h5 className="mb-0">📞 Contacto</h5>
                                </div>
                                <div className="card-body">
                                    <p className="mb-2"><strong>Teléfono:</strong> {cafeData.contact.phone}</p>
                                    <p className="mb-2"><strong>Email:</strong> {cafeData.contact.email}</p>
                                    <p className="mb-0"><strong>Web:</strong> {cafeData.contact.website}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'photos' && (
                    <div className="row">
                        {cafeData.images.map((image, index) => (
                            <div key={index} className="col-md-4 mb-4">
                                <div className="card border-0 shadow-sm">
                                    <img
                                        src={image}
                                        className="card-img-top"
                                        alt={`${cafeData.name} - Foto ${index + 1}`}
                                        style={{ height: '250px', objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CafeDetail;