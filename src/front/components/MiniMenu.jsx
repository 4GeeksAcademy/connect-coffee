import React, { useState, useEffect } from 'react';
import { getFrontStoreMenu } from '../services/api_menu.js';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const MiniMenu = ({ storeId, title = "Menú de la Cafetería" }) => {
    const { store } = useGlobalReducer();
    const [menuData, setMenuData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    useEffect(() => {
        if (storeId) {
            loadMenuFromAPI();
        }
    }, [storeId]);

    const loadMenuFromAPI = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getFrontStoreMenu(storeId);

            if (response && response.ok && response.data) {
                let allProducts = [];

                if (Array.isArray(response.data)) {
                    if (response.data.length > 0 && response.data[0].name) {
                        allProducts = response.data;
                    } else if (response.data.length > 0 && response.data[0].products) {
                        response.data.forEach(menu => {
                            if (menu.products && Array.isArray(menu.products)) {
                                allProducts = allProducts.concat(menu.products);
                            }
                        });
                    }
                }

                const groupedMenu = allProducts.reduce((acc, product) => {
                    const category = product.category || "Productos Principales";
                    if (!acc[category]) {
                        acc[category] = [];
                    }

                    acc[category].push({
                        id: product.id,
                        name: product.name || 'Producto sin nombre',
                        price: product.price || 0,
                        description: product.description || '',
                        is_active: product.is_active !== false && product.available !== false
                    });
                    return acc;
                }, {});

                setMenuData(groupedMenu);

            } else {
                setError('No se encontró información del menú');
            }
        } catch (error) {
            setError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount || amount === 0) return 'Consultar precio';
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount);
    };

    const getTotalProducts = () => {
        return Object.values(menuData).reduce((total, items) => total + items.length, 0);
    };

    const toggleUnavailableProducts = (categoryName) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryName)) {
            newExpanded.delete(categoryName);
        } else {
            newExpanded.add(categoryName);
        }
        setExpandedCategories(newExpanded);
    };

    if (loading) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-4">
                    <div className="spinner-border text-warning mb-2" role="status">
                        <span className="visually-hidden">Cargando menú...</span>
                    </div>
                    <p className="mb-0 text-muted">Obteniendo productos de la cafetería...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <div className="alert alert-warning mb-0">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>No se pudo cargar el menú</strong><br />
                        <small>{error}</small>
                        <div className="mt-2">
                            <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={loadMenuFromAPI}
                            >
                                <i className="fas fa-redo me-1"></i>
                                Intentar nuevamente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (Object.keys(menuData).length === 0) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                    <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted mb-2">Menú no disponible</h5>
                    <p className="text-muted mb-3">
                        Esta cafetería aún no ha publicado su menú
                    </p>
                    <button
                        className="btn btn-outline-warning btn-sm"
                        onClick={loadMenuFromAPI}
                    >
                        <i className="fas fa-sync-alt me-1"></i>
                        Verificar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="menu-container">
            {/* Header del menú */}
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-header text-white bg-brown">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-0">
                                <i className="fas fa-utensils me-2"></i>
                                {title}
                            </h5>
                            <small className="opacity-75">
                                <i className="fas fa-coffee me-1"></i>
                                Carta de productos disponibles
                            </small>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            <span className="badge bg-light text-dark">
                                {getTotalProducts()} productos
                            </span>
                            <span className="badge bg-light text-dark">
                                {Object.keys(menuData).length} categorías
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de categorías compacto */}
            <div className="row g-3">
                {Object.entries(menuData).map(([category, items]) => {
                    const activeItems = items.filter(item => item.is_active);
                    const inactiveItems = items.filter(item => !item.is_active);
                    const isExpanded = expandedCategories.has(category);

                    return (
                        <div key={category} className="col-lg-6 col-md-12">
                            <div className="card border-0 shadow-sm h-100">
                                {/* Header de categoría */}
                                <div className="card-header bg-brown text-white py-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 fw-bold">{category}</h6>
                                        {activeItems.length > 0 && (
                                            <span className="badge bg-success">
                                                {activeItems.length} disponibles
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="card-body p-0 bg-cream">
                                    {/* Lista compacta de productos disponibles */}
                                    {activeItems.length === 0 ? (
                                        <div className="text-center py-4">
                                            <i className="fas fa-clock text-muted mb-2"></i>
                                            <p className="text-muted mb-0 small">
                                                No hay productos disponibles
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="list-group list-group-flush">
                                            {activeItems.map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className="list-group-item bg-transparent border-0 py-2 px-3"
                                                >
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <div className="fw-semibold text-brown mb-0">
                                                                {item.name}
                                                            </div>
                                                            {item.description && (
                                                                <small className="text-muted d-block">
                                                                    {item.description}
                                                                </small>
                                                            )}
                                                        </div>
                                                        <div className="text-gold fw-bold ms-2">
                                                            {formatCurrency(item.price)}
                                                        </div>
                                                    </div>
                                                    {index < activeItems.length - 1 && (
                                                        <hr className="my-2 opacity-25" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Productos no disponibles */}
                                    {inactiveItems.length > 0 && (
                                        <div className="border-top bg-light p-2">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    <i className="fas fa-times-circle me-1"></i>
                                                    {inactiveItems.length} no disponibles
                                                </small>
                                                <button
                                                    className="btn btn-sm btn-outline-secondary py-0 px-2"
                                                    onClick={() => toggleUnavailableProducts(category)}
                                                    type="button"
                                                >
                                                    <small>
                                                        {isExpanded ? (
                                                            <>
                                                                <i className="fas fa-eye-slash me-1"></i>
                                                                Ocultar
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-eye me-1"></i>
                                                                Ver
                                                            </>
                                                        )}
                                                    </small>
                                                </button>
                                            </div>

                                            {/* Lista colapsable de no disponibles */}
                                            <div className={`collapse ${isExpanded ? 'show' : ''}`}>
                                                <div className="mt-2">
                                                    {inactiveItems.map((item, index) => (
                                                        <div
                                                            key={item.id}
                                                            className={`d-flex justify-content-between align-items-center py-1 ${index !== inactiveItems.length - 1 ? 'border-bottom border-light' : ''
                                                                }`}
                                                        >
                                                            <small className="text-muted text-decoration-line-through">
                                                                {item.name}
                                                            </small>
                                                            <small className="badge bg-secondary">
                                                                No disponible
                                                            </small>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="card border-0 shadow-sm mt-3">
                <div className="card-footer bg-cream text-center border-0 py-2">
                    <button
                        className="btn btn-brown btn-sm"
                        onClick={loadMenuFromAPI}
                        disabled={loading}
                    >
                        <i className="fas fa-sync-alt me-1"></i>
                        Actualizar menú
                    </button>
                    <div className="mt-1">
                        <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Menú actualizado automáticamente
                        </small>
                    </div>
                </div>
            </div>

            {/* CSS */}
            <style jsx>{`
                :root {
                    --brown-primary: #8B4513;
                    --brown-secondary: #A0522D;
                    --gold-color: #CD853F;
                    --cream-bg: #FFF8F0;
                    --light-brown: #E8D5C4;
                }

                .bg-brown {
                    background: linear-gradient(135deg, var(--brown-primary) 0%, var(--brown-secondary) 100%) !important;
                }

                .bg-cream {
                    background-color: var(--cream-bg) !important;
                }

                .text-brown {
                    color: var(--brown-primary) !important;
                }

                .text-gold {
                    color: var(--gold-color) !important;
                }

                .btn-brown {
                    background-color: var(--brown-primary);
                    border-color: var(--brown-primary);
                    color: white;
                }

                .btn-brown:hover {
                    background-color: var(--brown-secondary);
                    border-color: var(--brown-secondary);
                    color: white;
                }

                .list-group-item:hover {
                    background-color: rgba(139, 69, 19, 0.05) !important;
                }

                .collapse {
                    transition: all 0.3s ease-in-out;
                }

                .card {
                    transition: transform 0.2s ease-in-out;
                }

                .card:hover {
                    transform: translateY(-2px);
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .col-lg-6 {
                        margin-bottom: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default MiniMenu;