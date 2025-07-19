import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('favoritos');
    const [loading, setLoading] = useState(true);

    // Mock data
    const mockUser = {
        id: 1,
        name: "María González",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face",
        created_at: "2023-01-15",
        bio: "Amante del café y exploradora de nuevos sabores"
    };

    const mockFavorites = [
        {
            id: 1,
            name: "Café Central",
            description: "Ambiente acogedor con especialidad en café de origen y repostería artesanal. Ideal para trabajar o relajarse.",
            image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=250&fit=crop",
            rating: 4.5,
            review_count: 124,
            status: "Abierto ahora",
            tags: ["WiFi", "Pet Friendly", "Sin TACC"]
        },
        {
            id: 2,
            name: "Tostadería del Centro",
            description: "Especialistas en tueste artesanal con granos seleccionados de diferentes regiones.",
            image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=250&fit=crop",
            rating: 4.8,
            review_count: 89,
            status: "Abierto ahora",
            tags: ["WiFi", "Zona Fumadores"]
        },
        {
            id: 3,
            name: "Café Literario",
            description: "Un espacio único que combina el amor por los libros y el café de calidad.",
            image: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=400&h=250&fit=crop",
            rating: 4.2,
            review_count: 67,
            status: "Cerrado",
            tags: ["WiFi", "Espacios Azules"]
        }
    ];

    const mockReviews = [
        {
            id: 1,
            cafe_name: "Café Central",
            cafe_image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&h=100&fit=crop",
            rating: 5,
            comment: "Excelente lugar para trabajar, el wifi es muy bueno y el café delicioso. La atención es muy amable.",
            created_at: "2024-06-15",
            cafe_id: 1
        },
        {
            id: 2,
            cafe_name: "Tostadería del Centro",
            cafe_image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=100&h=100&fit=crop",
            rating: 4,
            comment: "Los granos son de excelente calidad. Me encanta venir aquí por las mañanas.",
            created_at: "2024-06-10",
            cafe_id: 2
        },
        {
            id: 3,
            cafe_name: "Café Literario",
            cafe_image: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=100&h=100&fit=crop",
            rating: 4,
            comment: "Ambiente muy tranquilo, perfecto para leer. Solo le falta un poco más de variedad en el menú.",
            created_at: "2024-06-05",
            cafe_id: 3
        }
    ];

    useEffect(() => {
        setUser(mockUser);
        setLoading(false);
    }, [userId]);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={i < rating ? 'text-warning' : 'text-muted'}>
                ★
            </span>
        ));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTagColor = (tag) => {
        const colors = {
            'WiFi': 'primary',
            'Pet Friendly': 'warning',
            'Sin TACC': 'danger',
            'Zona Fumadores': 'secondary',
            'Espacios Azules': 'info'
        };
        return colors[tag] || 'secondary';
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" style={{ color: '#8B4513' }} role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="container mt-4">
                {/* Botón Volver */}
                <div className="row mb-3">
                    <div className="col">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigate(-1)}
                            style={{ borderRadius: '25px' }}
                        >
                            ← Volver
                        </button>
                    </div>
                </div>

                <div className="row">
                    {/* Columna izquierda - Imagen del usuario */}
                    <div className="col-md-8">
                        <img
                            src={user?.avatar}
                            alt={user?.name}
                            className="img-fluid rounded"
                            style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Columna derecha - Información del usuario */}
                    <div className="col-md-4">
                        <div className="p-4" style={{ backgroundColor: 'white', borderRadius: '10px', height: '400px' }}>
                            <div className="text-center mb-3">
                                <img
                                    src={user?.avatar}
                                    alt={user?.name}
                                    className="rounded-circle mb-2"
                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                />
                            </div>

                            <h2 style={{ color: '#8B4513' }} className="mb-1">{user?.name}</h2>
                            <div className="d-flex mb-2">
                                <span className="text-warning me-1">★★★★★</span>
                                <span>4.5 ({mockReviews.length} reseñas)</span>
                            </div>
                            <p className="text-muted mb-3">{user?.bio}</p>

                            <div className="mb-3">
                                <span className="badge bg-success mb-2">Miembro activo</span>
                            </div>

                            <div className="mb-3">
                                <span className="badge me-1" style={{ backgroundColor: '#007bff', color: 'white' }}>
                                    📱 {mockFavorites.length} Favoritos
                                </span>
                                <span className="badge me-1" style={{ backgroundColor: '#28a745', color: 'white' }}>
                                    ⭐ {mockReviews.length} Reseñas
                                </span>
                            </div>

                            <button
                                className="btn w-100 mb-2"
                                style={{ backgroundColor: '#8B4513', color: 'white', borderRadius: '25px' }}
                            >
                                ❤️ Seguir Usuario
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navegación de tabs */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="d-flex">
                            <button
                                className={`btn me-2 ${activeTab === 'favoritos' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setActiveTab('favoritos')}
                                style={{ borderRadius: '25px' }}
                            >
                                📍 Favoritos
                            </button>
                            <button
                                className={`btn me-2 ${activeTab === 'reviews' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setActiveTab('reviews')}
                                style={{ borderRadius: '25px' }}
                            >
                                ℹ️ Mis Reseñas
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contenido de favoritos */}
                {activeTab === 'favoritos' && (
                    <div className="row mt-4">
                        {mockFavorites.map((cafe) => (
                            <div key={cafe.id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                                    <img
                                        src={cafe.image}
                                        alt={cafe.name}
                                        className="card-img-top"
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <img
                                                src={cafe.image}
                                                alt={cafe.name}
                                                className="rounded-circle"
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                            />
                                            <div className="flex-grow-1 ms-3">
                                                <h5 style={{ color: '#8B4513' }} className="mb-1">{cafe.name}</h5>
                                                <div className="d-flex align-items-center mb-1">
                                                    <span className="text-warning me-1">★★★★★</span>
                                                    <span className="me-2">{cafe.rating}</span>
                                                    <span className="text-muted">({cafe.review_count} reseñas)</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-muted small mb-3">{cafe.description}</p>

                                        <div className="mb-3">
                                            <span className={`badge bg-${cafe.status === 'Abierto ahora' ? 'success' : 'danger'} mb-2`}>
                                                {cafe.status}
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            {cafe.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className={`badge bg-${getTagColor(tag)} me-1 mb-1`}
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="card-footer" style={{ backgroundColor: 'transparent', border: 'none' }}>
                                        <button
                                            className="btn w-100"
                                            style={{ backgroundColor: '#8B4513', color: 'white', borderRadius: '25px' }}
                                            onClick={() => navigate(`/CafeDetails`)}
                                        >
                                            ❤️ Visitar Cafetería
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Contenido de reseñas */}
                {activeTab === 'reviews' && (
                    <div className="row mt-4">
                        {mockReviews.map((review) => (
                            <div key={review.id} className="col-12 mb-4">
                                <div className="card" style={{ borderRadius: '15px' }}>
                                    <div className="card-body">
                                        <div className="row align-items-center">
                                            <div className="col-md-2">
                                                <img
                                                    src={review.cafe_image}
                                                    alt={review.cafe_name}
                                                    className="rounded"
                                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="col-md-10">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 style={{ color: '#8B4513' }} className="mb-1">
                                                        <a
                                                            href={`/cafeteria/${review.cafe_id}`}
                                                            className="text-decoration-none"
                                                            style={{ color: '#8B4513' }}
                                                        >
                                                            {review.cafe_name}
                                                        </a>
                                                    </h6>
                                                    <small className="text-muted">{formatDate(review.created_at)}</small>
                                                </div>

                                                <div className="mb-2">
                                                    {renderStars(review.rating)}
                                                    <span className="ms-2 fw-bold">{review.rating}/5</span>
                                                </div>

                                                <p className="mb-0">{review.comment}</p>
                                            </div>
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

export default UserDetail;