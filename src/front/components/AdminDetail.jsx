import React, { useState, useEffect } from 'react';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import {
    getAdminStoresList,
    getAdminStats,
    updateStoreStatus,
    deleteStore,
    getAdminStoreDetail
} from '../services/api_admin.js';

const AdminDetail = () => {
    const { store, dispatch } = useGlobalReducer();
    const [currentView, setCurrentView] = useState('dashboard');
    const [stores, setStores] = useState([]);
    const [filteredStores, setFilteredStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [actionType, setActionType] = useState('');
    const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, pending: 0 });
    const [error, setError] = useState(null);
    const [storeDetail, setStoreDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        if (store.token) {
            loadStores();
            loadStats();
        } else {
            setError('Token de autenticación no disponible');
        }
    }, [store.token]);

    useEffect(() => {
        filterStores();
    }, [stores, searchTerm, statusFilter]);

    const loadStores = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Cargando tiendas desde API...');
            const response = await getAdminStoresList(store.token);
            console.log('Respuesta de API stores:', response);

            if (response && response.ok && response.data) {
                // Normalizar datos del backend basado en models.py por ver ** //
                const normalizedStores = response.data.map(storeItem => ({
                    id: storeItem.id,
                    name: storeItem.nombre || storeItem.name || 'Sin nombre',
                    address: storeItem.direccion || storeItem.address || 'Sin dirección',
                    owner: storeItem.username || storeItem.user?.username || 'Sin propietario',
                    email: storeItem.user?.email || 'Sin email',
                    status: normalizeStatus(storeItem.is_active), // backend usa is_active boolean se cambio para que se pudiese utilizar como boolean y str
                    rating: storeItem.total_points || 0,
                    reviews_count: storeItem.points?.length || 0,
                    created_at: storeItem.created_at,
                    updated_at: storeItem.updated_at,
                    user_id: storeItem.user_id,
                    fecha_de_pago: storeItem.fecha_de_pago,
                    categories: storeItem.categories || [],
                    images: storeItem.images || [],
                    is_active: storeItem.is_active
                }));

                setStores(normalizedStores);
                console.log('Tiendas normalizadas:', normalizedStores);
            } else {
                const errorMsg = response?.msg || 'Error al cargar las tiendas';
                console.error('Error en respuesta:', errorMsg);
                setError(errorMsg);
            }
        } catch (error) {
            console.error('Error cargando tiendas:', error);
            setError('Error de conexión: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    const normalizeStatus = (isActive) => {
        if (isActive === true) return 'active';
        if (isActive === false) return 'suspended';
        return 'pending';
    };

    const loadStats = async () => {
        try {
            console.log('Cargando estadísticas desde API...');
            const response = await getAdminStoresList(store.token);
            console.log('Respuesta para calcular estadísticas:', response);

            if (response && response.ok && response.data) {
                const storesData = response.data;
                const total = storesData.length;
                const active = storesData.filter(store => store.is_active === true).length;
                const suspended = storesData.filter(store => store.is_active === false).length;
                const pending = storesData.filter(store =>
                    store.is_active === null ||
                    store.is_active === undefined
                ).length;

                const calculatedStats = { total, active, suspended, pending };
                setStats(calculatedStats);
                console.log('Estadísticas calculadas desde API:', calculatedStats);
            } else {
                console.warn('No se pudieron obtener datos para calcular estadísticas');
                if (stores.length > 0) {
                    calculateLocalStats();
                }
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            if (stores.length > 0) {
                calculateLocalStats();
            }
        }
    };

    const loadStoreDetail2 = (storeId) => {
        return store.filter(storeItem => storeItem.id === storeId);
    }

    const loadStoreDetail = async (storeId) => {
        setLoadingDetail(true);
        setError(null);
        try {
            console.log('Cargando detalle de tienda:', storeId);
            const response = await getAdminStoreDetail(store.token, storeId);
            console.log('Respuesta detalle tienda:', response);

            if (response && response.ok && response.data) {
                // Se normalizo para poder transformar los datos y darle uso // 
                const normalizedDetail = {
                    id: response.data.id,
                    name: response.data.nombre || response.data.name || 'Sin nombre',
                    address: response.data.direccion || response.data.address || 'Sin dirección',
                    owner: response.data.username || response.data.user?.username || 'Sin propietario',
                    email: response.data.user?.email || 'Sin email',
                    status: normalizeStatus(response.data.is_active),
                    rating: response.data.total_points || 0,
                    reviews_count: response.data.points?.length || 0,
                    created_at: response.data.created_at,
                    updated_at: response.data.updated_at,
                    user_id: response.data.user_id,
                    fecha_de_pago: response.data.fecha_de_pago,
                    categories: response.data.categories || [],
                    images: response.data.images || [],
                    is_active: response.data.is_active,
                    has_wifi: response.data.categories?.some(cat => cat.name?.toLowerCase().includes('wifi')) || false,
                    pet_friendly: response.data.categories?.some(cat => cat.name?.toLowerCase().includes('pet')) || false,
                    gluten_free: response.data.categories?.some(cat => cat.name?.toLowerCase().includes('tacc')) || false,
                    smoking_area: response.data.categories?.some(cat => cat.name?.toLowerCase().includes('fumar')) || false,
                    quiet_space: response.data.categories?.some(cat => cat.name?.toLowerCase().includes('azul')) || false
                };

                setStoreDetail(normalizedDetail);
                setCurrentView('detail');
            } else {
                const errorMsg = response?.msg || 'Error al cargar el detalle de la tienda';
                setError(errorMsg);
            }
        } catch (error) {
            console.error('Error cargando detalle:', error);
            setError('Error al cargar el detalle: ' + error.message);
        } finally {
            setLoadingDetail(false);
        }
    };

    const filterStores = () => {
        let filtered = stores;

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(storeItem =>
                storeItem.name?.toLowerCase().includes(searchLower) ||
                storeItem.owner?.toLowerCase().includes(searchLower) ||
                storeItem.email?.toLowerCase().includes(searchLower) ||
                storeItem.address?.toLowerCase().includes(searchLower)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(storeItem => storeItem.status === statusFilter);
        }

        setFilteredStores(filtered);
    };

    const handleStoreAction = (storeItem, action) => {
        setSelectedStore(storeItem);
        setActionType(action);
        setShowModal(true);
    };

    const confirmAction = async () => {
        if (!selectedStore) return;

        setLoading(true);
        setError(null);
        try {
            console.log(`Ejecutando ${actionType} en tienda:`, selectedStore);
            let response;

            switch (actionType) {
                case 'activate':
                    response = await updateStoreStatus(store.token, selectedStore.id, true);
                    break;
                case 'suspend':
                    response = await updateStoreStatus(store.token, selectedStore.id, false);
                    break;
                case 'delete':
                    response = await deleteStore(store.token, selectedStore.id);
                    break;
                default:
                    throw new Error('Acción no válida');
            }

            console.log(`Respuesta ${actionType}:`, response);

            if (response && response.ok) {
                console.log(`✅ ${actionType} exitoso en ${selectedStore.name}`);
                if (actionType === 'delete') {
                    setStores(prev => prev.filter(s => s.id !== selectedStore.id));
                } else {
                    setStores(prev => prev.map(s =>
                        s.id === selectedStore.id
                            ? { ...s, status: actionType === 'activate' ? 'active' : 'suspended', is_active: actionType === 'activate' }
                            : s
                    ));
                }
                setError(null);
                if (storeDetail && storeDetail.id === selectedStore.id) {
                    if (actionType === 'delete') {
                        setCurrentView('dashboard');
                        setStoreDetail(null);
                    } else {
                        setStoreDetail(prev => ({
                            ...prev,
                            status: actionType === 'activate' ? 'active' : 'suspended',
                            is_active: actionType === 'activate'
                        }));
                    }
                }
            } else {
                const errorMsg = response?.msg || `Error al ejecutar ${actionType}`;
                console.error(`❌ Error en ${actionType}:`, errorMsg);
                setError(errorMsg);
            }
        } catch (error) {
            console.error(`❌ Error en ${actionType}:`, error);
            setError(`Error de conexión: ${error.message}`);
        } finally {
            setLoading(false);
            setShowModal(false);
            setSelectedStore(null);
            setActionType('');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: 'success', icon: '✅', text: 'Activo' },
            suspended: { color: 'warning', icon: '⚠️', text: 'Suspendido' },
            pending: { color: 'info', icon: '⏳', text: 'Pendiente' },
            inactive: { color: 'danger', icon: '❌', text: 'Inactivo' }
        };

        const config = statusConfig[status] || statusConfig.inactive;
        return (
            <span className={`badge bg-${config.color} d-flex align-items-center gap-1`}>
                <span>{config.icon}</span>
                {config.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    const getStoreImage = (storeItem) => {
        if (storeItem.images && storeItem.images.length > 0) {
            return storeItem.images[0].url;
        }
        return null;
    };

    const DashboardView = () => (
        <div>
            {/* Estadísticas principales */}
            <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-primary text-danger-emphasis h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Total Cafeterías</h6>
                                    <h2 className="mb-0">{stats.total}</h2>
                                </div>
                                <div className="align-self-center">
                                    <i className="fas fa-store fa-2x opacity-75"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-success text-danger-emphasis h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Activas</h6>
                                    <h2 className="mb-0">{stats.active}</h2>
                                    <small className="opacity-75">
                                        {stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(1)}%` : '0%'}
                                    </small>
                                </div>
                                <div className="align-self-center">
                                    <i className="fas fa-check-circle fa-2x opacity-75"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-warning text-danger-emphasis h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Suspendidas</h6>
                                    <h2 className="mb-0">{stats.suspended}</h2>
                                    <small className="opacity-75">
                                        {stats.total > 0 ? `${((stats.suspended / stats.total) * 100).toFixed(1)}%` : '0%'}
                                    </small>
                                </div>
                                <div className="align-self-center">
                                    <i className="fas fa-exclamation-triangle fa-2x opacity-75"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-info text-danger-emphasis h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Pendientes</h6>
                                    <h2 className="mb-0">{stats.pending}</h2>
                                    <small className="opacity-75">
                                        {stats.total > 0 ? `${((stats.pending / stats.total) * 100).toFixed(1)}%` : '0%'}
                                    </small>
                                </div>
                                <div className="align-self-center">
                                    <i className="fas fa-clock fa-2x opacity-75"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por nombre, propietario, email o dirección..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        title="Limpiar búsqueda"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Todos los estados</option>
                                <option value="active">Activos</option>
                                <option value="suspended">Suspendidos</option>
                                <option value="pending">Pendientes</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <button
                                className="btn btn-primary w-100"
                                onClick={() => {
                                    loadStores();
                                    loadStats();
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Cargando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-sync-alt me-2"></i>
                                        Actualizar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de cafeterías */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="fas fa-list me-2"></i>
                        Gestión de Cafeterías
                    </h5>
                    <span className="badge bg-secondary">
                        {filteredStores.length} de {stores.length}
                    </span>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-3 text-muted">Cargando cafeterías desde API...</p>
                        </div>
                    ) : error && stores.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                            <h5 className="text-danger">Error al cargar las cafeterías</h5>
                            <p className="text-muted mb-3">{error}</p>
                            <button className="btn btn-primary" onClick={loadStores}>
                                <i className="fas fa-redo me-2"></i>
                                Reintentar
                            </button>
                        </div>
                    ) : filteredStores.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-coffee fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">No se encontraron cafeterías</h5>
                            <p className="text-muted">
                                {stores.length === 0
                                    ? 'No hay cafeterías registradas en la base de datos'
                                    : 'Intenta con otros filtros de búsqueda'
                                }
                            </p>
                            {searchTerm && (
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => setSearchTerm('')}
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Cafetería</th>
                                        <th>Propietario</th>
                                        <th>Estado</th>
                                        <th>Rating</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStores.map((storeItem) => (
                                        <tr key={storeItem.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {getStoreImage(storeItem) && (
                                                        <img
                                                            src={getStoreImage(storeItem)}
                                                            alt={storeItem.name}
                                                            className="rounded me-2"
                                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <div>
                                                        <h6 className="mb-1">{storeItem.name}</h6>
                                                        <small className="text-muted">
                                                            <i className="fas fa-map-marker-alt me-1"></i>
                                                            {storeItem.address}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <strong>{storeItem.owner}</strong><br />
                                                    <small className="text-muted">
                                                        <i className="fas fa-envelope me-1"></i>
                                                        {storeItem.email}
                                                    </small>
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(storeItem.status)}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <span className="me-1">⭐</span>
                                                    <strong>{Number(storeItem.rating || 0).toFixed(1)}</strong>
                                                    <small className="text-muted ms-1">
                                                        ({storeItem.reviews_count})
                                                    </small>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        disabled={loading}
                                                    >
                                                        <i className="fas fa-cog me-1"></i>
                                                        Acciones
                                                    </button>

                                                    <ul className="dropdown-menu">
                                                        {/* Boton ver detalles */}
                                                        <li>
                                                            <button
                                                                className="dropdown-item text-primary"
                                                                onClick={() => loadStoreDetail2(storeItem.id)}
                                                            >
                                                                <i className="fas fa-eye me-2"></i>Ver Detalle
                                                            </button>
                                                        </li>
                                                        <li><hr className="dropdown-divider" /></li>
                                                        {storeItem.status === 'suspended' && (
                                                            <li>
                                                                <button
                                                                    className="dropdown-item text-success"
                                                                    onClick={() => handleStoreAction(storeItem, 'activate')}
                                                                >
                                                                    <i className="fas fa-check me-2"></i>Activar
                                                                </button>
                                                            </li>
                                                        )}
                                                        {storeItem.status === 'active' && (
                                                            <li>
                                                                <button
                                                                    className="dropdown-item text-warning"
                                                                    onClick={() => handleStoreAction(storeItem, 'suspend')}
                                                                >
                                                                    <i className="fas fa-ban me-2"></i>Suspender
                                                                </button>
                                                            </li>
                                                        )}
                                                        <li><hr className="dropdown-divider" /></li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item text-danger"
                                                                onClick={() => handleStoreAction(storeItem, 'delete')}
                                                            >
                                                                <i className="fas fa-trash me-2"></i>Eliminar
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
    const DetailView = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>
                    <i className="fas fa-store me-2"></i>
                    Detalle de Cafetería
                </h4>
                <button
                    className="btn btn-secondary"
                    onClick={() => {
                        setCurrentView('dashboard');
                        setStoreDetail(null);
                    }}
                >
                    <i className="fas fa-arrow-left me-2"></i>Volver
                </button>
            </div>

            {loadingDetail ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3 text-muted">Cargando detalles...</p>
                </div>
            ) : storeDetail ? (
                <div className="row">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Información General</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>ID:</strong> {storeDetail.id}</p>
                                        <p><strong>Nombre:</strong> {storeDetail.name}</p>
                                        <p><strong>Dirección:</strong> {storeDetail.address}</p>
                                        <p><strong>Propietario:</strong> {storeDetail.owner}</p>
                                        <p><strong>Email:</strong> {storeDetail.email}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Estado:</strong> {getStatusBadge(storeDetail.status)}</p>
                                        <p><strong>Rating:</strong> ⭐ {Number(storeDetail.rating || 0).toFixed(1)}</p>
                                        <p><strong>Reseñas:</strong> {storeDetail.reviews_count}</p>
                                        <p><strong>User ID:</strong> {storeDetail.user_id}</p>
                                    </div>
                                </div>
                                <hr />
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>Creado:</strong> {formatDate(storeDetail.created_at)}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Actualizado:</strong> {formatDate(storeDetail.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Imágenes de la tienda */}
                        {storeDetail.images && storeDetail.images.length > 0 && (
                            <div className="card mt-3">
                                <div className="card-header">
                                    <h5 className="mb-0">Imágenes</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        {storeDetail.images.map((image, index) => (
                                            <div key={index} className="col-md-4 mb-3">
                                                <img
                                                    src={image.url}
                                                    alt={`Imagen ${index + 1}`}
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                />
                                                <small className="text-muted d-block mt-1">
                                                    Tipo: {image.type} | Posición: {image.position}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-md-4">
                        {/* Acciones rápidas */}
                        <div className="card mt-3">
                            <div className="card-header">
                                <h5 className="mb-0">Acciones</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-grid gap-2">
                                    {storeDetail.status === 'suspended' && (
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleStoreAction(storeDetail, 'activate')}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-check me-2"></i>Activar Tienda
                                        </button>
                                    )}
                                    {storeDetail.status === 'active' && (
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => handleStoreAction(storeDetail, 'suspend')}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-ban me-2"></i>Suspender Tienda
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleStoreAction(storeDetail, 'delete')}
                                        disabled={loading}
                                    >
                                        <i className="fas fa-trash me-2"></i>Eliminar Tienda
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    No se pudieron cargar los detalles de la cafetería.
                </div>
            )}
        </div>
    );

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="container py-4">
                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show mb-4">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Error:</strong> {error}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError(null)}
                        ></button>
                    </div>
                )}

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1">
                            <i className="fas fa-cogs me-2 text-primary"></i>
                            Panel de Administración
                        </h2>
                        <p className="text-muted">
                            Gestiona todas las cafeterías de la plataforma
                            {store.user && (
                                <span className="ms-2">
                                    | Conectado como: <strong>{store.user}</strong>
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                    </div>
                </div>

                {/* Contenido principal */}
                {currentView === 'dashboard' && <DashboardView />}
                {currentView === 'detail' && <DetailView />}

                {/* Modal de confirmación */}
                {showModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
                                        Confirmar acción
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                        disabled={loading}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p className="mb-3">
                                        ¿Estás seguro que deseas <strong>{getActionText(actionType)}</strong> la cafetería{' '}
                                        <strong>"{selectedStore?.name}"</strong>?
                                    </p>

                                    {actionType === 'delete' && (
                                        <div className="alert alert-danger mb-3">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            <strong>Advertencia:</strong> Esta acción eliminará permanentemente la cafetería y no se puede deshacer.
                                        </div>
                                    )}

                                    {selectedStore && (
                                        <div className="card">
                                            <div className="card-body">
                                                <h6 className="card-title">Información de la cafetería:</h6>
                                                <p className="card-text mb-1">
                                                    <strong>ID:</strong> {selectedStore.id}
                                                </p>
                                                <p className="card-text mb-1">
                                                    <strong>Propietario:</strong> {selectedStore.owner}
                                                </p>
                                                <p className="card-text mb-1">
                                                    <strong>Email:</strong> {selectedStore.email}
                                                </p>
                                                <p className="card-text mb-0">
                                                    <strong>Estado actual:</strong> {getStatusBadge(selectedStore.status)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                        disabled={loading}
                                    >
                                        <i className="fas fa-times me-2"></i>Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${actionType === 'delete' ? 'btn-danger' : actionType === 'activate' ? 'btn-success' : 'btn-warning'}`}
                                        onClick={confirmAction}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <i className={`fas ${getActionIcon(actionType)} me-2`}></i>
                                                Confirmar {getActionText(actionType)}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
    function getActionText(action) {
        switch (action) {
            case 'activate': return 'activar';
            case 'suspend': return 'suspender';
            case 'delete': return 'eliminar';
            default: return action;
        }
    }

    function getActionIcon(action) {
        switch (action) {
            case 'activate': return 'fa-check';
            case 'suspend': return 'fa-ban';
            case 'delete': return 'fa-trash';
            default: return 'fa-cog';
        }
    }
};

export default AdminDetail;
