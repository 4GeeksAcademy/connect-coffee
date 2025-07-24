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
    const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStores();
        loadStats();
    }, []);

    useEffect(() => {
        filterStores();
    }, [stores, searchTerm, statusFilter]);

    const loadStores = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Cargando tiendas desde API...');
            const response = await getAdminStoresList(store.token);
            console.log('Respuesta de API:', response);

            if (response && response.ok && response.data) {
                setStores(response.data);
                console.log('Tiendas cargadas desde API:', response.data);
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

    // Cargar estadísticas de back //
    const loadStats = async () => {
        try {
            console.log('Cargando estadísticas desde API...');
            const response = await getAdminStats(store.token);
            console.log('Respuesta estadísticas:', response);

            if (response && response.ok && response.data) {
                setStats(response.data);
                console.log('Estadísticas cargadas:', response.data);
            } else {
                // Si no hay estadísticas específicas, calcular desde las tiendas
                console.log('Calculando estadísticas localmente');
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    };

    const filterStores = () => {
        let filtered = stores;

        if (searchTerm) {
            filtered = filtered.filter(store =>
                store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(store => store.status === statusFilter);
        }

        setFilteredStores(filtered);
    };

    const handleStoreAction = (store, action) => {
        setSelectedStore(store);
        setActionType(action);
        setShowModal(true);
    };
    const confirmAction = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log(`Ejecutando ${actionType} en tienda:`, selectedStore);
            let response;

            switch (actionType) {
                case 'activate':
                    response = await updateStoreStatus(store.token, selectedStore.id, 'active');
                    break;
                case 'suspend':
                    response = await updateStoreStatus(store.token, selectedStore.id, 'suspended');
                    break;
                case 'delete':
                    response = await deleteStore(store.token, selectedStore.id);
                    break;
                default:
                    throw new Error('Acción no válida');
            }

            console.log(`Respuesta ${actionType}:`, response);

            if (response && response.ok) {
                console.log(`${actionType} exitoso en ${selectedStore.name}`);

                // Actualizar la lista de tiendas //
                if (actionType === 'delete') {
                    setStores(prev => prev.filter(s => s.id !== selectedStore.id));
                } else {
                    setStores(prev => prev.map(s =>
                        s.id === selectedStore.id
                            ? { ...s, status: actionType === 'activate' ? 'active' : 'suspended' }
                            : s
                    ));
                }

                // Actualizar estadísticas //
                loadStats();
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

    // is active ** //
    const getLocalStats = () => {
        if (stats.total > 0) return stats; // Usar estadísticas de la API

        const total = stores.length;
        const active = stores.filter(s => s.status === 'active').length;
        const suspended = stores.filter(s => s.status === 'suspended').length;
        const pending = stores.filter(s => s.status === 'pending').length;

        return { total, active, suspended, pending };
    };

    const currentStats = getLocalStats();

    const DashboardView = () => (
        <div>
            {/* Estadísticas principales */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Total Cafeterías</h6>
                                    <h2 className="mb-0">{currentStats.total}</h2>
                                </div>
                                <div className="align-self-center">
                                    <i className="fas fa-store fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Activas</h6>
                                    <h2 className="mb-0">{currentStats.active}</h2>
                                </div>
                                <div className="align-self-center">
                                    <i className="fas fa-check-circle fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Suspendidas</h6>
                                    <h2 className="mb-0">{currentStats.suspended}</h2>
                                </div>
                                <div className="align-self-center">
                                    <i className="fas fa-exclamation-triangle fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por nombre, propietario o email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
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
                                onClick={loadStores}
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
                <div className="card-header">
                    <h5 className="mb-0">
                        <i className="fas fa-list me-2"></i>
                        Gestión de Cafeterías ({filteredStores.length})
                    </h5>
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
                            <p className="text-muted">{error}</p>
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
                                                <div>
                                                    <h6 className="mb-1">{storeItem.name || 'Sin nombre'}</h6>
                                                    <small className="text-muted">{storeItem.address || 'Sin dirección'}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <strong>{storeItem.owner || 'Sin propietario'}</strong><br />
                                                    <small className="text-muted">{storeItem.email || 'Sin email'}</small><br />
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(storeItem.status)}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <span className="me-1">⭐</span>
                                                    <strong>{(storeItem.rating || 0).toFixed(1)}</strong>
                                                    <small className="text-muted ms-1">({storeItem.reviews_count || 0})</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                    >
                                                        Acciones
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => setCurrentView('detail')}
                                                            >
                                                                <i className="fas fa-eye me-2"></i>Ver detalles
                                                            </button>
                                                        </li>
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

    // Detalle de cafetería (placeholder) //
    const DetailView = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Detalle de Cafetería</h4>
                <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentView('dashboard')}
                >
                    <i className="fas fa-arrow-left me-2"></i>Volver
                </button>
            </div>
            <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                Vista de detalle en desarrollo. Aquí se mostrará información completa de la cafetería seleccionada.
            </div>
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
                        <p className="text-muted">Gestiona todas las cafeterías de la plataforma</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className={`btn ${currentView === 'dashboard' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setCurrentView('dashboard')}
                        >
                            <i className="fas fa-tachometer-alt me-2"></i>Dashboard
                        </button>
                        <button className="btn btn-success">
                            <i className="fas fa-plus me-2"></i>Nueva Cafetería
                        </button>
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
                                    <h5 className="modal-title">Confirmar acción</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p>
                                        ¿Estás seguro que deseas <strong>{actionType}</strong> la cafetería{' '}
                                        <strong>"{selectedStore?.name}"</strong>?
                                    </p>
                                    {actionType === 'delete' && (
                                        <div className="alert alert-danger">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            <strong>Advertencia:</strong> Esta acción no se puede deshacer.
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
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${actionType === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                                        onClick={confirmAction}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Procesando...
                                            </>
                                        ) : (
                                            `Confirmar ${actionType}`
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
};

export default AdminDetail;