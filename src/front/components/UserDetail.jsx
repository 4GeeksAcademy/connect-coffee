import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, getUserFavorites, getUserReviews } from '../services/api_user.js';
import { getStoreDetail } from '../services/api_store.js';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import ImageNotFound from "../assets/img/image-not-found.png";
import CafeDetail from './CafeDetail.jsx';

const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { store } = useGlobalReducer();
    const [user, setUser] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState('favoritos');
    const [loading, setLoading] = useState(true);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estado para el detalle de cafetería (igual que StoreIndex)
    const [currentView, setCurrentView] = useState("userProfile");
    const [selectedCafeteria, setSelectedCafeteria] = useState(null);

    // Mapeo de iconos para categorías (mismo que en StoreIndex)
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
        if (userId) {
            loadUserProfile();
        }
    }, [userId]);

    useEffect(() => {
        if (activeTab === 'favoritos' && favorites.length === 0) {
            loadUserFavorites();
        } else if (activeTab === 'reviews' && reviews.length === 0) {
            loadUserReviews();
        }
    }, [activeTab]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getUserProfile(userId);

            if (response && response.ok && response.data) {
                setUser(response.data);
            } else {
                setError(response?.msg || 'Error al cargar el perfil del usuario');
            }
        } catch (err) {
            setError('Error de conexión: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadUserFavorites = async () => {
        try {
            setFavoritesLoading(true);
            const response = await getUserFavorites(userId);

            if (response && response.ok && response.data) {
                setFavorites(response.data);
            } else {
                console.error('Error cargando favoritos:', response?.msg);
                setFavorites([]);
            }
        } catch (err) {
            console.error('Error cargando favoritos:', err);
            setFavorites([]);
        } finally {
            setFavoritesLoading(false);
        }
    };

    const loadUserReviews = async () => {
        try {
            setReviewsLoading(true);
            const response = await getUserReviews(userId);

            if (response && response.ok && response.data) {
                setReviews(response.data);
            } else {
                console.error('Error cargando reseñas:', response?.msg);
                setReviews([]);
            }
        } catch (err) {
            console.error('Error cargando reseñas:', err);
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleCafeClick = async (cafeId) => {
        try {
            console.log("Cargando detalles de tienda:", cafeId);
            const response = await getStoreDetail(cafeId);

            if (response && response.ok && response.data) {
                setSelectedCafeteria(response.data);
                setCurrentView("detail");
                console.log('Cafetería detallada:', response.data);
            } else {
                console.error('Error cargando detalle de cafetería:', response?.msg);
            }
        } catch (err) {
            console.error("Error cargando detalle:", err);
        }
    };

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

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "#F6E0C4" }}>
                <div className="text-center">
                    <div className="spinner-border" style={{ color: '#8B4513' }} role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando perfil de usuario...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "#F6E0C4" }}>
                <div className="text-center">
                    <i className="fas fa-user-times fa-4x text-muted mb-3"></i>
                    <h3 className="text-muted">Usuario no encontrado</h3>
                    <p className="text-muted">{error}</p>
                    <button className="btn btn-warning mt-3" onClick={() => navigate(-1)}>
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-vh-100" style={{ backgroundColor: "#F6E0C4" }}>
            {/* Mostrar perfil de usuario */}
            {currentView === "userProfile" && (
                <div className="container py-4">
                    {/* Botón de volver */}
                    <div className="mb-4">
                        <button
                            onClick={() => navigate(-1)}
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
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            Volver
                        </button>
                    </div>

                    {/* Header del perfil */}
                    <div className="card mb-4 border-0 shadow">
                        <div className="card-body p-4">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    {/* Información básica del usuario */}
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{ width: '80px', height: '80px' }}>
                                            <i className="fas fa-user fa-2x text-white"></i>
                                        </div>
                                        <div>
                                            <h2 className="mb-1" style={{ color: "#8B4513" }}>
                                                {user.username}
                                            </h2>
                                            <p className="text-muted mb-1">@{user.username}</p>
                                            <small className="text-muted">
                                                <i className="fas fa-calendar-alt me-1"></i>
                                                Miembro de la comunidad cafetera
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    {/* Estadísticas */}
                                    <div className="d-flex justify-content-end">
                                        <div className="text-center me-4">
                                            <div className="h4 mb-1" style={{ color: "#8B4513" }}>
                                                {user.favorites_count || 0}
                                            </div>
                                            <small className="text-muted">Favoritos</small>
                                        </div>
                                        <div className="text-center">
                                            <div className="h4 mb-1" style={{ color: "#8B4513" }}>
                                                {user.reviews_count || 0}
                                            </div>
                                            <small className="text-muted">Reseñas</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navegación de tabs */}
                    <div className="d-flex justify-content-center mb-4">
                        <div className="d-flex gap-2">
                            <button
                                className="btn px-4 py-2"
                                onClick={() => setActiveTab('favoritos')}
                                style={{
                                    backgroundColor: activeTab === 'favoritos' ? '#8B4513' : 'transparent',
                                    color: activeTab === 'favoritos' ? 'white' : '#8B4513',
                                    border: '1px solid #8B4513',
                                    borderRadius: '20px'
                                }}
                            >
                                📍 Favoritos ({user.favorites_count || 0})
                            </button>
                            <button
                                className="btn px-4 py-2"
                                onClick={() => setActiveTab('reviews')}
                                style={{
                                    backgroundColor: activeTab === 'reviews' ? '#8B4513' : 'transparent',
                                    color: activeTab === 'reviews' ? 'white' : '#8B4513',
                                    border: '1px solid #8B4513',
                                    borderRadius: '20px'
                                }}
                            >
                                ⭐ Reseñas ({user.reviews_count || 0})
                            </button>
                        </div>
                    </div>

                    {/* Contenido de favoritos */}
                    {activeTab === 'favoritos' && (
                        <div className="row">
                            {favoritesLoading ? (
                                <div className="col-12 text-center py-5">
                                    <div className="spinner-border text-warning" role="status">
                                        <span className="visually-hidden">Cargando favoritos...</span>
                                    </div>
                                    <p className="mt-3 text-muted">Cargando cafeterías favoritas...</p>
                                </div>
                            ) : favorites.length === 0 ? (
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body text-center py-5">
                                            <i className="fas fa-heart fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">No hay cafeterías favoritas</h5>
                                            <p className="text-muted">
                                                Este usuario aún no ha agregado cafeterías a sus favoritos.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                favorites.map((cafe) => (
                                    <div key={cafe.id} className="col-md-6 col-lg-4 mb-4">
                                        <div className="card h-100 border-0 shadow-sm"
                                            style={{ borderRadius: '15px', overflow: 'hidden' }}>
                                            <img
                                                src={cafe.images?.[0]?.url || ImageNotFound}
                                                alt={cafe.name}
                                                className="card-img-top"
                                                style={{ height: '200px', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.src = ImageNotFound;
                                                }}
                                            />
                                            <div className="card-body">
                                                <h5 className="card-title mb-2" style={{ color: '#8B4513' }}>
                                                    {cafe.name}
                                                </h5>

                                                <div className="d-flex align-items-center mb-2">
                                                    {renderStars(Math.floor(cafe.total_points || 0))}
                                                    <span className="ms-2 fw-bold">
                                                        {(cafe.total_points || 0).toFixed(1)}
                                                    </span>
                                                    <span className="ms-1 text-muted">
                                                        ({cafe.points?.length || 0} reseñas)
                                                    </span>
                                                </div>

                                                <p className="text-muted small mb-3">
                                                    {cafe.address}
                                                </p>

                                                {/* Categorías */}
                                                {cafe.categories && cafe.categories.length > 0 && (
                                                    <div className="mb-3">
                                                        {cafe.categories.slice(0, 3).map((category) => {
                                                            const icon = categoryIconMap[category.name] || 'fas fa-tag';
                                                            return (
                                                                <span
                                                                    key={category.id}
                                                                    className="badge me-1 mb-1"
                                                                    style={{
                                                                        backgroundColor: "#D2B48C",
                                                                        color: "#8B4513",
                                                                        fontSize: '0.75rem'
                                                                    }}
                                                                >
                                                                    <i className={`${icon} me-1`}></i>
                                                                    {category.name}
                                                                </span>
                                                            );
                                                        })}
                                                        {cafe.categories.length > 3 && (
                                                            <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
                                                                +{cafe.categories.length - 3} más
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="card-footer bg-transparent border-0">
                                                <button
                                                    className="btn w-100"
                                                    style={{
                                                        backgroundColor: '#8B4513',
                                                        color: 'white',
                                                        borderRadius: '25px'
                                                    }}
                                                    onClick={() => handleCafeClick(cafe.id)}
                                                >
                                                    Ver Cafetería
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Contenido de reseñas */}
                    {activeTab === 'reviews' && (
                        <div className="row">
                            {reviewsLoading ? (
                                <div className="col-12 text-center py-5">
                                    <div className="spinner-border text-warning" role="status">
                                        <span className="visually-hidden">Cargando reseñas...</span>
                                    </div>
                                    <p className="mt-3 text-muted">Cargando reseñas del usuario...</p>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body text-center py-5">
                                            <i className="fas fa-star fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">No hay reseñas</h5>
                                            <p className="text-muted">
                                                Este usuario aún no ha escrito reseñas.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="col-12 mb-4">
                                        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                            <div className="card-body">
                                                <div className="row align-items-start">
                                                    <div className="col-md-2">
                                                        <img
                                                            src={review.store?.images?.[0]?.url || ImageNotFound}
                                                            alt={review.store?.name}
                                                            className="rounded"
                                                            style={{
                                                                width: '100px',
                                                                height: '100px',
                                                                objectFit: 'cover'
                                                            }}
                                                            onError={(e) => {
                                                                e.target.src = ImageNotFound;
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-md-10">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <h6 className="mb-1">
                                                                <button
                                                                    className="btn btn-link p-0 text-start"
                                                                    style={{
                                                                        color: '#8B4513',
                                                                        textDecoration: 'none'
                                                                    }}
                                                                    onClick={() => handleCafeClick(review.store?.id)}
                                                                >
                                                                    {review.store?.name}
                                                                </button>
                                                            </h6>
                                                            <small className="text-muted">
                                                                <i className="fas fa-calendar-alt me-1"></i>
                                                                {formatDate(review.created_at)}
                                                            </small>
                                                        </div>

                                                        <div className="mb-2">
                                                            {renderStars(review.points)}
                                                            <span className="ms-2 fw-bold text-warning">
                                                                {review.points}/5
                                                            </span>
                                                        </div>

                                                        <p className="mb-2 text-muted small">
                                                            <i className="fas fa-map-marker-alt me-1"></i>
                                                            {review.store?.address}
                                                        </p>

                                                        <p className="mb-0" style={{ lineHeight: '1.6' }}>
                                                            "{review.description}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Mostrar detalle de cafetería */}
            {currentView === "detail" && selectedCafeteria && (
                <CafeDetail
                    cafeData={selectedCafeteria}
                    onBack={() => {
                        setCurrentView("userProfile");
                        setSelectedCafeteria(null);
                    }}
                />
            )}
        </div>
    );
};

export default UserDetail;