import React, { useEffect, useState } from 'react';
import { getStore } from "../services/api_store";
import { getStoreMenu } from "../services/api_menu";
import { useParams, useLocation } from 'react-router-dom';
import MenuPreview from "./MenuPreview.jsx"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import Cloudinary from './Cloudinary.jsx';
import NotFound from '../pages/NotFound.jsx'
import { useNavigate } from 'react-router-dom';
import {
  menuCreate,
  productCreate,
  getProducts,
  updateProduct,
  deleteProduct,
  deactivateProduct,
  activateProduct
} from "../services/api_product";

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('cafe');
  const [showProfile, setShowProfile] = useState(false);
  const [editingMenu, setEditingMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Para detectar cambios en URL
  const { id } = useParams();
  const [storeDetails, setStoreDetails] = useState(null);
  const [storeMenu, setStoreMenu] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { store, dispatch } = useGlobalReducer();
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "",
    logo: null,
    backgroundImage: null
  });

  const [menuCategories, setMenuCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [editingItem, setEditingItem] = useState(null);

  const provider = {
    name: "Carlos Mendoza",
    email: "carlos@cafcentral.com",
    avatar: "/api/placeholder/40/40",
    cafeName: "Café Central",
    memberSince: "2024",
    paymentStatus: "active"
  };

  // ✅ CORREGIDO: Detectar tab desde URL con mejor debugging
  useEffect(() => {
    console.log('🔍 Detectando tab desde URL...');
    console.log('Current location:', location);
    console.log('Current search params:', location.search);

    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');

    console.log('Tab extraído de URL:', tabFromUrl);

    if (tabFromUrl === 'menu') {
      console.log('✅ Cambiando a tab MENU');
      setActiveTab('menu');
    } else if (tabFromUrl === 'config') {
      console.log('✅ Cambiando a tab CONFIG');
      setActiveTab('config');
    } else {
      console.log('✅ Cambiando a tab CAFE (default)');
      setActiveTab('cafe');
    }
  }, [location.search, location.pathname]); // ✅ Agregar location.pathname también

  // ✅ CORREGIDO: Función para manejar cambio de tab
  const handleTabChange = (newTab) => {
    console.log('🔄 Cambiando tab a:', newTab);
    setActiveTab(newTab);

    // Crear nueva URL
    const newUrl = new URL(window.location.href);

    if (newTab === 'cafe') {
      newUrl.searchParams.delete('tab'); // Tab por defecto, no necesita parámetro
    } else {
      newUrl.searchParams.set('tab', newTab);
    }

    console.log('🔗 Nueva URL:', newUrl.toString());

    // Cambiar URL sin recargar (esto puede causar el problema)
    // Mejor usar navigate de React Router
    if (newTab === 'cafe') {
      navigate(`/provider/${id}`, { replace: true });
    } else {
      navigate(`/provider/${id}?tab=${newTab}`, { replace: true });
    }
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const setImage = async (token, imageUrl, entity, entity_id, type) => {
    try {
      if (!token) {
        return { msg: "Debe iniciar sesion para gestionar la tienda", ok: false };
      }
      const request_body = {
        owner_type: entity,
        owner_id: entity_id,
        name: type,
        img_type: type,
        url: imageUrl,
        position: "1",
      };
      const response = await fetch(backendUrl + "/api/image/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(request_body)
      });
      if (!response.ok) {
        throw new Error(`Error Detectado ${response.status}: ${response.statusText}`);
      }
      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const setImageByType = async (token, imageUrl, type, owner_id) => {
    try {
      if (!token) {
        return { msg: "Debe iniciar sesion para poder gestionar imágenes", ok: false };
      }
      const request_body = {
        owner_type: type,
        owner_id: owner_id,
        name: type,
        img_type: type,
        url: imageUrl,
        position: "1",
      };
      const response = await fetch(backendUrl + "/api/image/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(request_body)
      });
      if (!response.ok) {
        throw new Error(`Error Detectado ${response.status}: ${response.statusText}`);
      }
      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleGetStoreDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando detalles de la tienda...');

      const response = await getStore(store.token, id);
      console.log('Respuesta store detail:', response);

      if (response && response.ok && response.data) {
        setStoreDetails(response);
        setRestaurantInfo(prev => ({
          ...prev,
          name: response.data.name || response.data.nombre || ""
        }));

        if (!response.data.is_active) {
          navigate('/payment');
          return;
        }

        console.log('Tienda cargada:', response.data);
      } else {
        const errorMsg = response?.msg || 'Error al cargar los detalles de la tienda';
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

  const handleGetStoreMenu = async () => {
    try {
      console.log('Cargando menú de la tienda...');
      const response = await getStoreMenu(store.token);
      console.log('Respuesta store menu:', response);

      if (response && response.ok && response.data) {
        setStoreMenu(response);
        console.log('Menú cargado:', response.data);
      } else {
        console.warn('No se pudo cargar el menú:', response?.msg);
      }
    } catch (err) {
      console.error('Error cargando menú:', err);
    }
  };

  const handleGetProducts = async () => {
    try {
      console.log('Cargando productos...');
      const response = await getProducts(store.token);
      console.log('Respuesta productos:', response);

      if (response && response.ok && response.data) {
        setProducts(response.data);
        const categoriesMap = {};
        response.data.forEach(product => {
          if (!categoriesMap[product.category]) {
            categoriesMap[product.category] = {
              id: product.category,
              name: product.category,
              items: []
            };
          }
          categoriesMap[product.category].items.push({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            available: product.is_active
          });
        });

        setMenuCategories(Object.values(categoriesMap));
        console.log('Productos organizados por categorías:', Object.values(categoriesMap));
      } else {
        console.warn('No se pudieron cargar los productos:', response?.msg);
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
    }
  };

  const handleCreateMenu = async () => {
    try {
      if (!storeDetails?.data?.id) {
        console.error('No hay ID de tienda disponible');
        return;
      }

      const menuData = {
        store_id: storeDetails.data.id,
        description: "Menu Principal"
      };

      const response = await menuCreate(store.token, menuData);
      console.log('Respuesta crear menú:', response);

      if (response && response.ok) {
        await handleGetStoreMenu();
        console.log('Menú creado exitosamente');
      } else {
        console.error('Error creando menú:', response?.msg);
      }
    } catch (err) {
      console.error('Error creando menú:', err);
    }
  };

  useEffect(() => {
    if (store.token && id) {
      handleGetStoreDetail();
      handleGetStoreMenu();
      handleGetProducts();
    } else {
      setError('Token o ID no disponible');
      setLoading(false);
    }
  }, [id, store.token]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-warning' : 'text-muted'}>
        ★
      </span>
    ));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const newCat = {
        id: newCategory.trim().toUpperCase(),
        name: newCategory.trim().toUpperCase(),
        items: []
      };

      setMenuCategories([...menuCategories, newCat]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const categoryToRemove = menuCategories.find(cat => cat.id === categoryId);
    if (categoryToRemove) {
      for (const item of categoryToRemove.items) {
        try {
          await deactivateProduct(store.token, item.id);
          await deleteProduct(store.token, item.id);
        } catch (err) {
          console.error('Error eliminando producto:', err);
        }
      }
    }

    setMenuCategories(menuCategories.filter(cat => cat.id !== categoryId));
  };

  const handleAddItem = async () => {
    if (newItem.name && newItem.price && newItem.category && storeMenu?.data?.[0]?.id) {
      try {
        const productData = {
          menu_id: storeMenu.data[0].id,
          name: newItem.name,
          description: newItem.description || '',
          category: newItem.category,
          price: parseInt(newItem.price)
        };

        const response = await productCreate(store.token, productData);
        console.log('Respuesta crear producto:', response);

        if (response && response.ok) {
          await handleGetProducts();
          setNewItem({ name: '', description: '', price: '', category: '' });
          console.log('Producto creado exitosamente');
        } else {
          console.error('Error creando producto:', response?.msg);
          alert('Error creando producto: ' + (response?.msg || 'Error desconocido'));
        }
      } catch (err) {
        console.error('Error creando producto:', err);
        alert('Error de conexión al crear producto');
      }
    } else {
      alert('Por favor complete todos los campos requeridos y asegúrese de tener un menú creado');
    }
  };

  const handleDeleteItem = async (categoryId, itemId) => {
    try {
      await deactivateProduct(store.token, itemId);
      const response = await deleteProduct(store.token, itemId);
      console.log('Respuesta eliminar producto:', response);

      if (response && response.ok) {
        await handleGetProducts();
        console.log('Producto eliminado exitosamente');
      } else {
        console.error('Error eliminando producto:', response?.msg);
        alert('Error eliminando producto: ' + (response?.msg || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error eliminando producto:', err);
      alert('Error de conexión al eliminar producto');
    }
  };

  const handleToggleAvailability = async (categoryId, itemId) => {
    try {
      const item = menuCategories
        .find(cat => cat.id === categoryId)
        ?.items.find(item => item.id === itemId);

      if (!item) return;

      const response = item.available
        ? await deactivateProduct(store.token, itemId)
        : await activateProduct(store.token, itemId);

      console.log('Respuesta toggle disponibilidad:', response);

      if (response && response.ok) {
        await handleGetProducts();
        console.log('Disponibilidad actualizada exitosamente');
      } else {
        console.error('Error actualizando disponibilidad:', response?.msg);
        alert('Error actualizando disponibilidad: ' + (response?.msg || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error actualizando disponibilidad:', err);
      alert('Error de conexión al actualizar disponibilidad');
    }
  };

  const handleEditItem = (categoryId, itemId) => {
    const item = menuCategories
      .find(cat => cat.id === categoryId)
      ?.items.find(item => item.id === itemId);

    if (item) {
      setEditingItem({
        ...item,
        categoryId: categoryId
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !storeMenu?.data?.[0]?.id) return;

    try {
      const productData = {
        menu_id: storeMenu.data[0].id,
        name: editingItem.name,
        description: editingItem.description || '',
        category: editingItem.categoryId,
        price: parseInt(editingItem.price)
      };

      const response = await updateProduct(store.token, editingItem.id, productData);
      console.log('Respuesta actualizar producto:', response);

      if (response && response.ok) {
        await handleGetProducts();
        setEditingItem(null);
        console.log('Producto actualizado exitosamente');
      } else {
        console.error('Error actualizando producto:', response?.msg);
        alert('Error actualizando producto: ' + (response?.msg || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error actualizando producto:', err);
      alert('Error de conexión al actualizar producto');
    }
  };

  const handleImageUpload = async (imageUrl, type, ownerId) => {
    try {
      let response;

      if (type === 'menu' && storeMenu?.data?.[0]?.id) {
        response = await setImageByType(store.token, imageUrl, 'menu', storeMenu.data[0].id);
      } else if (type === 'store' && storeDetails?.data?.id) {
        response = await setImage(store.token, imageUrl, 'store', storeDetails.data.id, 'index');
      }

      console.log('Respuesta subida imagen:', response);

      if (response && response.ok) {
        console.log('Imagen subida exitosamente');
      } else {
        console.error('Error subiendo imagen:', response?.msg);
        alert('Error subiendo imagen: ' + (response?.msg || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      alert('Error de conexión al subir imagen');
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#FFF5EB' }}>
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando dashboard del proveedor...</p>
        </div>
      </div>
    );
  }

  if (error || !storeDetails?.ok) {
    return <NotFound />;
  }

  const cafeData = storeDetails.data || {};
  // test tabs en navbar ** //
  console.log('🎯 Estado actual del tab:', activeTab);
  console.log('🔗 URL actual:', location.pathname + location.search);

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#FFF5EB' }}>
      {/* Main Content */}
      <div className="container-fluid py-4">
        {/* Cafe Tab */}
        {activeTab === 'cafe' && (
          <div className="card shadow-sm">
            <div className="row g-0">
              <div className="col-md-5">
                <img
                  src={cafeData.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600"}
                  className="img-fluid h-100 w-100"
                  alt={cafeData.name || cafeData.nombre}
                  style={{ objectFit: 'cover', minHeight: '400px' }}
                />
              </div>
              <div className="col-md-7">
                <div className="card-body h-100 d-flex flex-column">
                  <div className="row mb-4">
                    <div className="col-6">
                      <div className="text-center p-3 bg-danger-subtle">
                        <div className="fs-3">❤️</div>
                        <div className="fw-bold fs-4">{cafeData.favorites || 0}</div>
                        <small className="text-muted">Favoritos</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-3 bg-warning-subtle">
                        <div className="fs-3">⭐</div>
                        <div className="fw-bold fs-4">{(cafeData.total_points || 0).toFixed(1)}</div>
                        <small className="text-muted">Rating</small>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h3 className="mb-2">{cafeData.name || cafeData.nombre}</h3>
                      <div className="d-flex align-items-center mb-2">
                        {renderStars(cafeData.total_points || 0)}
                        <span className="ms-2 text-muted">{(cafeData.total_points || 0).toFixed(1)}</span>
                      </div>
                      <div className="text-muted mb-2">
                        🕒 {cafeData.opening_hours || "Horario no disponible"}
                      </div>
                    </div>
                    <button
                      className={`btn ${editingMenu ? 'btn-success' : 'btn-warning'}`}
                      onClick={() => setEditingMenu(!editingMenu)}
                    >
                      {editingMenu ? '💾 Guardar Cambios' : '✏️ Editar'}
                    </button>
                  </div>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6>Información</h6>
                      <div className="mb-2">
                        <small className="text-muted">📍 {cafeData.address || cafeData.direccion || "Ubicación no disponible"}</small>
                      </div>
                      <span className={`badge ${cafeData.is_active ? 'bg-success' : 'bg-danger'}`}>
                        {cafeData.is_active ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <h6>Características</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {cafeData.has_wifi && (
                          <span className="badge bg-primary">
                            📶 WiFi
                          </span>
                        )}
                        {cafeData.pet_friendly && (
                          <span className="badge bg-success">
                            🐕 Pet Friendly
                          </span>
                        )}
                        {cafeData.gluten_free && (
                          <span className="badge bg-warning">
                            🛡️ Sin TACC
                          </span>
                        )}
                        {cafeData.smoking_area && (
                          <span className="badge bg-secondary">
                            🚬 Zona Fumadores
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h6>Descripción</h6>
                    <p className="text-muted mb-0">{cafeData.description || "Sin descripción disponible"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Menú</h3>
              <div>
                <button className="btn btn-primary me-2" onClick={() => dispatch({ type: "menu_preview", payload: true })}>
                  👁️ Vista Previa
                </button>
                <button
                  className={`btn ${editingMenu ? 'btn-success' : 'btn-warning'}`}
                  onClick={() => setEditingMenu(!editingMenu)}
                >
                  {editingMenu ? '💾 Guardar Cambios' : '✏️ Editar Menú'}
                </button>
              </div>
            </div>

            {/* Crear menú si no existe */}
            {!storeMenu?.data?.length && (
              <div className="card shadow-sm mb-4">
                <div className="card-body text-center">
                  <h5>No tienes un menú creado</h5>
                  <p className="text-muted">Crea tu primer menú para comenzar a agregar productos</p>
                  <button className="btn btn-primary" onClick={handleCreateMenu}>
                    ➕ Crear Menú
                  </button>
                </div>
              </div>
            )}

            {/* Editor de Menú */}
            {editingMenu && storeMenu?.data?.length > 0 && (
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-4">Editor de Menú</h5>

                  {/* Agregar Categoría */}
                  <div className="row mb-4">
                    <div className="col-md-8">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nueva categoría (ej: BEBIDAS, COMIDAS, POSTRES)"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <button className="btn btn-primary w-100" onClick={handleAddCategory}>
                        ➕ Agregar Categoría
                      </button>
                    </div>
                  </div>

                  {/* Agregar Producto */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6>Agregar Nuevo Producto</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nombre del producto"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Descripción"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          />
                        </div>
                        <div className="col-md-2">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Precio"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                          />
                        </div>
                        <div className="col-md-2">
                          <select
                            className="form-select"
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                          >
                            <option value="">Seleccionar categoría</option>
                            {menuCategories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-2">
                          <button className="btn btn-success w-100" onClick={handleAddItem}>
                            ➕ Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Edición de Producto */}
            {editingItem && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Editar Producto</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setEditingItem(null)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editingItem.name}
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Descripción</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editingItem.description || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Precio</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editingItem.price}
                          onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditingItem(null)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleUpdateItem}
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Categorías y Productos */}
            <div className="row">
              {menuCategories.map(category => (
                <div key={category.id} className="col-12 mb-4">
                  <div className="card shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">{category.name}</h5>
                      {editingMenu && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          🗑️ Eliminar Categoría
                        </button>
                      )}
                    </div>
                    <div className="card-body">
                      {category.items.length === 0 ? (
                        <p className="text-muted">No hay productos en esta categoría</p>
                      ) : (
                        <div className="row">
                          {category.items.map(item => (
                            <div key={item.id} className="col-md-6 col-lg-4 mb-3">
                              <div className={`card h-100 ${item.available ? '' : 'opacity-50'}`}>
                                <div className="card-body">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="card-title">{item.name}</h6>
                                    {editingMenu && (
                                      <div className="dropdown">
                                        <button
                                          className="btn btn-sm btn-light dropdown-toggle"
                                          type="button"
                                          data-bs-toggle="dropdown"
                                        >
                                          ⋮
                                        </button>
                                        <ul className="dropdown-menu">
                                          <li>
                                            <button
                                              className="dropdown-item"
                                              onClick={() => handleEditItem(category.id, item.id)}
                                            >
                                              ✏️ Editar
                                            </button>
                                          </li>
                                          <li>
                                            <button
                                              className="dropdown-item"
                                              onClick={() => handleToggleAvailability(category.id, item.id)}
                                            >
                                              {item.available ? '❌ Desactivar' : '✅ Activar'}
                                            </button>
                                          </li>
                                          <li>
                                            <button
                                              className="dropdown-item text-danger"
                                              onClick={() => handleDeleteItem(category.id, item.id)}
                                            >
                                              🗑️ Eliminar
                                            </button>
                                          </li>
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="card-text small text-muted">{item.description}</p>
                                  )}
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-success">{formatCurrency(item.price)}</span>
                                    <span className={`badge ${item.available ? 'bg-success' : 'bg-danger'}`}>
                                      {item.available ? 'Disponible' : 'No Disponible'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mensaje si no hay categorías */}
            {menuCategories.length === 0 && (
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <h5 className="text-muted">No hay categorías creadas</h5>
                  <p className="text-muted">Comienza agregando una categoría para organizar tus productos</p>
                  {editingMenu && (
                    <div className="row justify-content-center">
                      <div className="col-md-6">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nombre de categoría (ej: BEBIDAS)"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                          />
                          <button className="btn btn-primary" onClick={handleAddCategory}>
                            ➕ Crear
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel de información del menú (solo para debug) */}
            {storeMenu?.data && (
              <div className="card shadow-sm mt-4">
                <div className="card-header">
                  <h6 className="mb-0">Información del Sistema</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <small className="text-muted">ID del Menú:</small>
                      <div className="fw-bold">{storeMenu.data[0]?.id || 'N/A'}</div>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">ID de la Tienda:</small>
                      <div className="fw-bold">{storeMenu.data[0]?.store.id || 'N/A'}</div>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Total Productos:</small>
                      <div className="fw-bold">{products.length}</div>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Categorías:</small>
                      <div className="fw-bold">{menuCategories.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Vista previa del menú */}
      {store.menu_preview && storeMenu?.data && (
        <MenuPreview menu_id={storeMenu.data[0]?.id} />
      )}
    </div>
  );
};

export default ProviderDashboard;