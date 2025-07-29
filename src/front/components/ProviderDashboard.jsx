import React, { useEffect, useState } from 'react';
import { updateStore, getUserStore, getStore } from "../services/api_store";
import { getStoreMenu } from "../services/api_menu";
import { getCategories, categorySet, categoryUnset } from "../services/api_category";
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
import { favoriteGet, favoriteStoreGet } from "../services/api_favorite";
import { setImage, setImageByType, ImageDelete } from "../services/api_image";
import { getStorePoints } from "../services/api_userpoints";

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('cafe');
  const [editingMenu, setEditingMenu] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [editingCafe, setEditingCafe] = useState(false);
  const [tempCafeData, setTempCafeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeDetails, setStoreDetails] = useState(null);
  const [storeMenu, setStoreMenu] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [availableStoreCategories, setAvailableStoreCategories] = useState([]);
  const [activeStoreCategories, setActiveStoreCategories] = useState([]);
  const [loadingStoreCategories, setLoadingStoreCategories] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [newProductCategory, setNewProductCategory] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { store, dispatch } = useGlobalReducer();
  // ===================== FUNCIONES UTILITARIAS =====================
  const renderReviewStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-warning' : 'text-muted'}>
        ⭐
      </span>
    ));
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };
  const formatReviewDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CL');
  };
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'WiFi': '📶',
      'Pet Friendly': '🐕',
      'Sin TACC': '🛡️',
      'Zona Fumadores': '🚬',
      'Zona Fumadores lokos': '🚬',
      'Espacios azules': '🔵'
    };
    return iconMap[categoryName] || '📋';
  };
  // ===================== FUNCIONES DE CATEGORÍAS =====================
  const handleToggleStoreCategory = async (categoryId, isChecked) => {
    try {
      console.log('🔄 Actualizando categoría:', { categoryId, isChecked, storeId: id });

      let response;

      if (isChecked) {
        console.log('Agregando categorias:', categoryId);
        response = await categorySet(store.token, id, {
          category_ids: [categoryId]
        });
      } else {
        console.log('Removiendo categorias:', categoryId);
        response = await categoryUnset(store.token, id, {
          category_ids: [categoryId]
        });
      }
      console.log('📋 Respuesta del servidor:', response);
      if (response && response.ok) {
        if (isChecked) {
          const category = availableStoreCategories.find(cat => cat.id === categoryId);
          if (category && !activeStoreCategories.find(cat => cat.id === categoryId)) {
            setActiveStoreCategories(prev => [...prev, category]);
            console.log('✅ Categoría agregada al estado local:');
          }
        } else {
          setActiveStoreCategories(prev => prev.filter(cat => cat.id !== categoryId));
          console.log('✅ Categoría removida del estado local:');
        }
        await handleGetStoreDetail();
      } else {
        console.error('❌ Error del servidor:', response);
        alert('Error actualizando categoría: ' + (response?.msg || 'Error desconocido'));
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
      alert('Error de conexión al actualizar categoría: ' + err.message);
    }
  };
  const syncStoreCategories = () => {
    if (storeDetails?.data?.categories && availableStoreCategories.length > 0) {
      console.log('🔄 Sincronizando categorías de la tienda...');
      console.log('📊 Categorías en storeDetails:', storeDetails.data.categories);

      let categoryIds = [];
      if (Array.isArray(storeDetails.data.categories)) {
        categoryIds = storeDetails.data.categories.map(cat => typeof cat === 'object' ? cat.id : cat
        );
      }
      const storeCats = categoryIds.map(catId =>
        availableStoreCategories.find(cat => cat.id === catId)
      ).filter(Boolean);

      console.log('✅ Categorías sincronizadas:', storeCats);
      setActiveStoreCategories(storeCats);
    } else {
      console.log('No hay Categorias para sincronizar:');
      setActiveStoreCategories([]);
    }
  };
  // ===================== FUNCIONES DE CARGA DE DATOS =====================
  const getUserStoreId = async () => {
    try {
      console.log('Obteniendo tienda del usuario...');
      const storeData = await getUserStore(store.token);
      console.log('Respuesta getUserStore:', storeData);

      if (storeData.ok && storeData.data && storeData.data.length > 0) {
        const storeId = storeData.data[0].id;
        console.log('Redirigiendo a /provider/' + storeId);
        navigate(`/provider/${storeId}`);
      } else {
        console.log('Usuario Store sin tienda, redirigiendo a crear tienda');
        showAlert('No tienes una tienda registrada. Serás redirigido para crear una.', 'warning');
        setTimeout(() => {
          navigate('/create-store');
        }, 2000);
      }
    } catch (error) {
      console.error('Error obteniendo tienda:', error);
      showAlert('Error al obtener información de la tienda', 'danger');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };
  const handleGetReviews = async () => {
    try {
      setLoadingReviews(true);
      console.log('🔍 Cargando reseñas de la tienda...');
      const response = await getStorePoints(store.token);
      console.log('📊 Respuesta de reseñas:', response);

      if (response && response.ok && response.data) {
        setReviews(response.data);
        console.log('✅ Reseñas cargadas exitosamente:', response.data.length);
      } else {
        console.warn('⚠️ No se pudieron cargar las reseñas:', response?.msg);
        setReviews([]);
      }
    } catch (error) {
      console.error('❌ Error cargando reseñas:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };
  const handleGetStoreCategories = async () => {
    try {
      setLoadingStoreCategories(true);
      console.log('🔍 Cargando categorías del sistema...');

      const categories = await getCategories(store.token);
      console.log('📋 Categorías recibidas:', categories);

      if (categories && Array.isArray(categories)) {
        setAvailableStoreCategories(categories);
        console.log('✅ Categorías guardadas en estado');
      } else {
        console.warn('⚠️ Formato de categorías incorrecto:', categories);
        setAvailableStoreCategories([]);
      }
    } catch (err) {
      console.error('❌ Error cargando categorías:', err);
      setAvailableStoreCategories([]);
    } finally {
      setLoadingStoreCategories(false);
    }
  };
  const handleGetFavorites = async () => {
    try {
      setLoadingFavorites(true);
      console.log('🔍 Cargando favoritos del usuario...');
      if (!store.token) {
        console.warn('⚠️ No hay token disponible para cargar favoritos');
        favoriteStoreGet(store.token, id);
        return;
      }
      const response = await favoriteStoreGet(store.token, id);
      console.log('📊 Respuesta favoritos completa:', response);
      if (response && response.ok) {
        const favoritesData = response.data || [];
        if (Array.isArray(favoritesData)) {
          console.log('✅ Favoritos cargados exitosamente:', favoritesData.length);
          setFavorites(favoritesData);
          localStorage.setItem("favorites", JSON.stringify(favoritesData));
          dispatch({ type: "favorites", payload: JSON.stringify(favoritesData) });
        } else {
          console.warn('⚠️ Los datos de favoritos no son un array:', favoritesData);
          setFavorites([]);
        }
      } else {
        console.warn('⚠️ Error en respuesta de favoritos:', response?.msg || 'Error desconocido');
        setFavorites([]);
        // 401 usuario no autorizado //
        if (response?.status === 401) {
          console.warn('🔐 Usuario no autorizado para ver favoritos');
        }
      }
    } catch (err) {
      console.error('❌ Error de conexión cargando favoritos:', err);
      setFavorites([]);
      console.warn('Favoritos no disponibles, continuando sin ellos');
    } finally {
      setLoadingFavorites(false);
    }
  };
  const handleGetStoreDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Cargando detalles de la tienda con ID:', id);

      if (!store.token) {
        setError('Token de autenticación no disponible');
        return;
      }

      if (!id) {
        setError('ID de tienda no disponible');
        return;
      }

      const response = await getStore(store.token, id);
      console.log('📊 Respuesta getStore:', response);

      if (response && response.ok && response.data) {
        setStoreDetails(response);
        console.log('📊 Categorías de la tienda:', response.data.categories);

        if (!response.data.is_active) {
          console.log('⚠️ Tienda inactiva, redirigiendo a payment');
          navigate('/payment');
          return;
        }
      } else {
        const errorMsg = response?.msg || response?.message || 'Error al cargar los detalles de la tienda';
        console.error('❌ Error cargando tienda:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('❌ Error de conexión al cargar tienda:', err);
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleGetStoreMenu = async () => {
    try {
      const response = await getStoreMenu(store.token);
      if (response && response.ok && response.data) {
        setStoreMenu(response);
      }
    } catch (err) {
      console.error('Error cargando menú:', err);
    }
  };
  const handleGetProducts = async () => {
    try {
      const response = await getProducts(store.token);

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

        setProductCategories(Object.values(categoriesMap));
        console.log('Productos organizados por categorías:', Object.values(categoriesMap));
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
    }
  };
  // Función unificada para recargar todos los datos
  const handleRefreshAllData = async () => {
    try {
      console.log('🔄 Recargando todos los datos...');
      await Promise.all([
        handleGetStoreDetail(),
        handleGetStoreCategories(),
        handleGetFavorites(),
        handleGetReviews(),
        handleGetProducts()
      ]);
      console.log('✅ Todos los datos recargados exitosamente');
    } catch (error) {
      console.error('❌ Error recargando datos:', error);
    }
  };

  // ===================== FUNCIONES DE EDICIÓN DE CAFÉ =====================
  const handleEditCafe = () => {
    if (editingCafe) {
      handleSaveCafeChanges();
    } else {
      setEditingCafe(true);
      setTempCafeData({
        name: storeDetails.data.name || storeDetails.data.nombre || '',
        description: storeDetails.data.description || '',
        address: storeDetails.data.address || storeDetails.data.direccion || '',
      });
    }
  };
  const handleSaveCafeChanges = async () => {
    try {
      console.log('💾 Guardando cambios del café...');
      console.log('📊 Datos temporales:', tempCafeData);
      console.log('🆔 Store ID:', id);
      console.log('🔗 Backend URL:', import.meta.env.VITE_BACKEND_URL);

      // Validar que tenemos datos mínimos
      if (!tempCafeData.name || tempCafeData.name.trim() === '') {
        alert('El nombre del café es obligatorio');
        return;
      }

      // Verificar que tenemos token y store ID
      if (!store.token) {
        alert('Error: No hay token de autenticación');
        return;
      }

      if (!id) {
        alert('Error: No se encontró el ID de la tienda');
        return;
      }

      // Preparar datos para enviar - usando los nombres correctos del backend
      const updateData = {
        nombre: tempCafeData.name.trim(),
        direccion: tempCafeData.address ? tempCafeData.address.trim() : '',
        description: tempCafeData.description ? tempCafeData.description.trim() : '',
        opening_hours: tempCafeData.opening_hours ? tempCafeData.opening_hours.trim() : ''
      };

      console.log('📤 Enviando datos:', updateData);

      // Mostrar loading
      setLoading(true);

      const result = await updateStore(store.token, id, updateData);
      console.log('📥 Respuesta del servidor:', result);

      if (result && result.ok) {
        // Actualizar el estado local con los nuevos datos
        setStoreDetails(prev => ({
          ...prev,
          data: {
            ...prev.data,
            name: tempCafeData.name,
            nombre: tempCafeData.name,
            description: tempCafeData.description,
            address: tempCafeData.address,
            direccion: tempCafeData.address,
            opening_hours: tempCafeData.opening_hours
          }
        }));

        setEditingCafe(false);
        setTempCafeData({});
        alert('✅ Información actualizada exitosamente');

        // Recargar datos del servidor para asegurar sincronización
        await handleGetStoreDetail();
      } else {
        console.error('❌ Error del servidor:', result);
        alert('❌ Error actualizando información: ' + (result?.msg || result?.message || 'Error desconocido'));
      }
    } catch (err) {
      console.error('❌ Error inesperado:', err);
      alert('Error inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleCancelEdit = () => {
    setEditingCafe(false);
    setTempCafeData({});
  };

  // ===================== FUNCIONES DE PRODUCTOS =====================
  const handleCreateMenu = async () => {
    try {
      if (!storeDetails?.data?.id) return;

      const response = await menuCreate(store.token, {
        store_id: storeDetails.data.id,
        description: "Menu Principal"
      });

      if (response && response.ok) {
        await handleGetStoreMenu();
      }
    } catch (err) {
      console.error('Error creando menú:', err);
    }
  };
  const handleAddProductCategory = () => {
    if (newProductCategory.trim()) {
      const newCat = {
        id: newProductCategory.trim().toUpperCase(),
        name: newProductCategory.trim().toUpperCase(),
        items: []
      };
      setProductCategories([...productCategories, newCat]);
      setNewProductCategory('');
    }
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
        if (response && response.ok) {
          await handleGetProducts();
          setNewItem({ name: '', description: '', price: '', category: '' });
        } else {
          alert('Error creando producto: ' + (response?.msg || 'Error desconocido'));
        }
      } catch (err) {
        alert('Error de conexión al crear producto');
      }
    } else {
      alert('Por favor complete todos los campos requeridos');
    }
  };
  const handleDeleteItem = async (categoryId, itemId) => {
    try {
      await deactivateProduct(store.token, itemId);
      const response = await deleteProduct(store.token, itemId);

      if (response && response.ok) {
        await handleGetProducts();
      } else {
        alert('Error eliminando producto: ' + (response?.msg || 'Error desconocido'));
      }
    } catch (err) {
      alert('Error de conexión al eliminar producto');
    }
  };
  const handleToggleAvailability = async (categoryId, itemId) => {
    try {
      const item = productCategories
        .find(cat => cat.id === categoryId)
        ?.items.find(item => item.id === itemId);

      if (!item) return;

      const response = item.available
        ? await deactivateProduct(store.token, itemId)
        : await activateProduct(store.token, itemId);

      if (response && response.ok) {
        await handleGetProducts();
      } else {
        alert('Error actualizando disponibilidad: ' + (response?.msg || 'Error desconocido'));
      }
    } catch (err) {
      alert('Error de conexión al actualizar disponibilidad');
    }
  };
  const handleEditItem = (categoryId, itemId) => {
    const item = productCategories
      .find(cat => cat.id === categoryId)
      ?.items.find(item => item.id === itemId);

    if (item) {
      setEditingItem({ ...item, categoryId: categoryId });
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

      if (response && response.ok) {
        await handleGetProducts();
        setEditingItem(null);
      } else {
        alert('Error actualizando producto: ' + (response?.msg || 'Error desconocido'));
      }
    } catch (err) {
      alert('Error de conexión al actualizar producto');
    }
  };

  // ===================== FUNCIONES DE IMÁGENES =====================

  const handleImageDelete = async (imageId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      await ImageDelete(store.token, imageId);
    }
  };
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'cafe') {
      navigate(`/provider/${id}`, { replace: true });
    } else {
      navigate(`/provider/${id}?tab=${newTab}`, { replace: true });
    }
  };
  // ===================== EFFECTS =====================
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');

    if (tabFromUrl === 'menu') {
      setActiveTab('menu');
    } else {
      setActiveTab('cafe');
    }
  }, [location.search, location.pathname]);

  useEffect(() => {
    if (store.token) {
      getUserStoreId();
      handleGetStoreDetail();
      handleGetStoreMenu();
      handleGetProducts();
      handleGetFavorites();
      handleGetStoreCategories();
      handleGetReviews();
      handleRefreshAllData();
    } else {
      setError('Token o ID no disponible');
      setLoading(false);
    }
  }, [id, store.token]);

  useEffect(() => {
    console.log('🔄 Effect: Sincronizando categorías...');
    console.log('📊 storeDetails?.data:', storeDetails?.data);
    console.log('📋 availableStoreCategories:', availableStoreCategories);
    syncStoreCategories();
  }, [storeDetails, availableStoreCategories]);
  // ===================== RENDER =====================
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
  const displayData = editingCafe ? tempCafeData : cafeData;

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#FFF5EB' }}>
      <div className="container-fluid py-4">
        {activeTab === 'cafe' && (
          <>
            {/* Información Principal de la Tienda */}
            <div className="card shadow-sm mb-4">
              <div className="row g-0">
                <div className="col-md-5">
                  <img
                    src={cafeData.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600"}
                    className="img-fluid h-100 w-100"
                    alt={displayData.name || displayData.nombre}
                    style={{ objectFit: 'cover', minHeight: '400px' }}
                  />
                </div>
                <div className="col-md-7">
                  <div className="card-body h-100 d-flex flex-column">
                    <div className="row mb-4">
                      <div className="col-6">
                        <div className="text-center p-3 bg-danger-subtle">
                          <div className="fs-3">❤️</div>
                          <div className="fw-bold fs-4">{favorites.length || 0}</div>
                          <small className="text-muted">Favoritos</small>
                          {loadingFavorites && (
                            <div className="spinner-border spinner-border-sm ms-2" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </div>
                          )}
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
                      <div className="flex-grow-1">
                        {editingCafe ? (
                          <input
                            type="text"
                            className="form-control form-control-lg mb-2"
                            value={tempCafeData.name || ''}
                            onChange={(e) => setTempCafeData({ ...tempCafeData, name: e.target.value })}
                            placeholder="Nombre del café"
                          />
                        ) : (
                          <h3 className="mb-2">{displayData.name || displayData.nombre}</h3>
                        )}
                      </div>

                      <div className="d-flex gap-2">
                        {editingCafe && (
                          <button
                            className="btn btn-secondary"
                            onClick={handleCancelEdit}
                            disabled={loading}
                          >
                            ❌ Cancelar
                          </button>
                        )}
                        <button
                          className={`btn ${editingCafe ? 'btn-success' : 'btn-warning'}`}
                          onClick={handleEditCafe}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                              {editingCafe ? 'Guardando...' : 'Cargando...'}
                            </>
                          ) : (
                            editingCafe ? '💾 Guardar Cambios' : '✏️ Editar'
                          )}
                        </button>
                        <button
                          className="btn btn-info"
                          onClick={handleRefreshAllData}
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          ) : (
                            '🔄'
                          )} Actualizar
                        </button>
                      </div>
                    </div>

                    {/* Información básica */}
                    <div className="row mb-4">
                      <div className="col-md-12">
                        <h6>Información</h6>
                        <div className="mb-2">
                          <small className="text-muted d-block mb-1">📍 Dirección:</small>
                          {editingCafe ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={tempCafeData.address || ''}
                              onChange={(e) => setTempCafeData({ ...tempCafeData, address: e.target.value })}
                              placeholder="Dirección del café"
                            />
                          ) : (
                            <div className="text-muted">
                              {displayData.address || displayData.direccion || "Ubicación no disponible"}
                            </div>
                          )}
                        </div>

                        <div className="mb-2">
                          <small className="text-muted d-block mb-1">🕒 Horarios:</small>
                          {editingCafe ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={tempCafeData.opening_hours || ''}
                              onChange={(e) => setTempCafeData({ ...tempCafeData, opening_hours: e.target.value })}
                              placeholder="Ej: Lun-Vie 8:00-18:00"
                            />
                          ) : (
                            <div className="text-muted">
                              {displayData.opening_hours || "Horarios no especificados"}
                            </div>
                          )}
                        </div>

                        <span className={`badge ${cafeData.is_active ? 'bg-success' : 'bg-danger'}`}>
                          {cafeData.is_active ? '✅ Abierto' : '❌ Cerrado'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h6>Descripción</h6>
                      {editingCafe ? (
                        <textarea
                          className="form-control"
                          rows="3"
                          value={tempCafeData.description || ''}
                          onChange={(e) => setTempCafeData({ ...tempCafeData, description: e.target.value })}
                          placeholder="Descripción del café"
                        />
                      ) : (
                        <p className="text-muted mb-0">{displayData.description || "Sin descripción disponible"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración y Estadísticas */}
            <div className="row mb-4">
              {/* Boton gestor de imagenes */}
              <div className="col-md-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header">
                    <h6 className="mb-0">🖼️ Gestión de Imágenes</h6>
                  </div>
                  <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <div className="row text-center mb-3">
                      <div className="col-4">
                        <small className="text-muted d-block mb-1">Tienda</small>
                        <img
                          src={cafeData.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600"}
                          alt="Imagen tienda"
                          className="img-thumbnail"
                          style={{ maxWidth: '60px', height: '40px', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block mb-1">Menú</small>
                        <img
                          src={storeMenu?.data?.[0]?.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600"}
                          alt="Imagen menú"
                          className="img-thumbnail"
                          style={{ maxWidth: '60px', height: '40px', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block mb-1">Index</small>
                        <img
                          src={storeDetails?.data?.index_image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600"}
                          alt="Imagen index"
                          className="img-thumbnail"
                          style={{ maxWidth: '60px', height: '40px', objectFit: 'cover' }}
                        />
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => setShowImageManager(true)}
                      disabled={imageLoading}
                    >
                      {imageLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Procesando...
                        </>
                      ) : (
                        <>
                          🖼️ Gestionar Imágenes
                        </>
                      )}
                    </button>

                    <small className="text-muted mt-2 text-center">
                      Administra las imágenes de tu tienda
                    </small>
                  </div>
                </div>
              </div>

              {/* Modal de Gestión de Imágenes */}
              {showImageManager && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">🖼️ Gestionar Imágenes</h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowImageManager(false)}
                          disabled={imageLoading}
                        ></button>
                      </div>
                      <div className="modal-body">
                        {imageLoading && (
                          <div className="alert alert-info">
                            <div className="d-flex align-items-center">
                              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                              <span>Procesando imagen, por favor espera...</span>
                            </div>
                          </div>
                        )}

                        <div className="row">
                          {/* Imagen de la Tienda */}
                          <div className="col-md-6">
                            <div className="card h-100">
                              <div className="card-header">
                                <h6 className="mb-0">🏪 Imagen de la Tienda</h6>
                              </div>
                              <div className="card-body text-center">
                                <div className="mb-3">
                                  <img
                                    src={cafeData.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600"}
                                    alt="Imagen actual de la tienda"
                                    className="img-thumbnail w-100"
                                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                                  />
                                </div>

                                <div className="d-grid gap-2">
                                  <Cloudinary
                                    preset="width400"
                                    image_type="store"
                                    owner_type="store"
                                    owner_id={storeDetails?.data?.id}
                                    label="Cambiar imagen de tienda"
                                  />

                                  {cafeData.image_url && (
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleImageDelete('store')}
                                      disabled={imageLoading}
                                    >
                                      🗑️ Eliminar Imagen
                                    </button>
                                  )}
                                </div>

                                <small className="text-muted mt-2 d-block">
                                  Esta imagen aparece en el perfil principal de tu tienda
                                </small>
                              </div>
                            </div>
                          </div>

                          {/* Imagen del Menú */}
                          <div className="col-md-6">
                            <div className="card h-100">
                              <div className="card-header">
                                <h6 className="mb-0">📋 Imagen del Menú</h6>
                              </div>
                              <div className="card-body text-center">
                                {storeMenu?.data?.length > 0 ? (
                                  <>
                                    <div className="mb-3">
                                      <img
                                        src={storeMenu.data[0]?.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600"}
                                        alt="Imagen actual del menú"
                                        className="img-thumbnail w-100"
                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                      />
                                    </div>

                                    <div className="d-grid gap-2">
                                      <Cloudinary
                                        preset="width400"
                                        image_type="menu"
                                        owner_type="menu"
                                        owner_id={storeMenu.data[0]?.id}
                                        label="Cambiar imagen de menú"
                                      />

                                      {storeMenu.data[0]?.image_url && (
                                        <button
                                          className="btn btn-outline-danger btn-sm"
                                          onClick={() => handleImageDelete('menu')}
                                          disabled={imageLoading}
                                        >
                                          🗑️ Eliminar Imagen
                                        </button>
                                      )}
                                    </div>

                                    <small className="text-muted mt-2 d-block">
                                      Esta imagen aparece en la vista del menú
                                    </small>
                                  </>
                                ) : (
                                  <div className="text-center py-4">
                                    <div className="text-muted">
                                      <h6>📋 Sin Menú</h6>
                                      <p>Primero debes crear un menú para poder subir una imagen</p>
                                      <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => {
                                          setShowImageManager(false);
                                          handleTabChange('menu');
                                        }}
                                      >
                                        Ir a Crear Menú
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Imagen del Index */}
                          <div className="col-md-4">
                            <div className="card h-100">
                              <div className="card-header">
                                <h6 className="mb-0">🌐 Imagen del Index</h6>
                              </div>
                              <div className="card-body text-center">
                                <div className="mb-3">
                                  <img
                                    src={storeDetails?.data?.index_image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600"}
                                    alt="Imagen actual del index"
                                    className="img-thumbnail w-100"
                                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                                  />
                                </div>

                                <div className="d-grid gap-2">
                                  <Cloudinary
                                    preset="width400"
                                    image_type="index"
                                    owner_type="store"
                                    owner_id={storeDetails?.data?.id}
                                    label="Cambiar imagen de index"
                                  />

                                  {storeDetails?.data?.index_image_url && (
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleImageDelete('index')}
                                      disabled={imageLoading}
                                    >
                                      🗑️ Eliminar Imagen
                                    </button>
                                  )}
                                </div>

                                <small className="text-muted mt-2 d-block">
                                  Esta imagen aparece en la página principal
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowImageManager(false)}
                          disabled={imageLoading}
                        >
                          Cerrar
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            handleRefreshAllData();
                            setShowImageManager(false);
                          }}
                          disabled={imageLoading}
                        >
                          🔄 Guardar y Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Estadísticas Resumidas */}
              <div className="col-md-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header">
                    <h6 className="mb-0">📊 Estadísticas de la Tienda</h6>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-4">
                        <div className="text-center p-3 bg-info-subtle rounded">
                          <div className="fs-3">📦</div>
                          <div className="fw-bold fs-4">{products.length}</div>
                          <small className="text-muted">Productos</small>
                          <div className="mt-1">
                            <small className="text-success">
                              ✅ {products.filter(p => p.is_active).length} activos
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="text-center p-3 bg-success-subtle rounded">
                          <div className="fs-3">📂</div>
                          <div className="fw-bold fs-4">{productCategories.length}</div>
                          <small className="text-muted">Categorías</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="text-center p-3 bg-warning-subtle rounded">
                          <div className="fs-3">📝</div>
                          <div className="fw-bold fs-4">{reviews.length}</div>
                          <small className="text-muted">Reseñas</small>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h6>Estado del Sistema</h6>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Estado de la tienda:</span>
                        <span className={`badge ${cafeData.is_active ? 'bg-success' : 'bg-danger'}`}>
                          {cafeData.is_active ? '✅ Activa' : '❌ Inactiva'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Menú configurado:</span>
                        <span className={`badge ${storeMenu?.data?.length > 0 ? 'bg-success' : 'bg-warning'}`}>
                          {storeMenu?.data?.length > 0 ? '✅ Sí' : '⚠️ No'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Características:</span>
                        <span className="badge bg-info">
                          {activeStoreCategories.length} activas
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Análisis de Reseñas */}
            <div className="card shadow-sm mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">⭐ Análisis de Reseñas</h6>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleGetReviews}
                  disabled={loadingReviews}
                >
                  {loadingReviews ? (
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  ) : (
                    '🔄'
                  )} Actualizar
                </button>
              </div>
              <div className="card-body">
                {loadingReviews ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando reseñas...</span>
                    </div>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-3">
                    <div className="text-muted">
                      <p>No tienes reseñas aún</p>
                      <small>Las reseñas de los usuarios aparecerán aquí</small>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-4">
                      <div className="text-center">
                        <div className="display-4 text-warning">⭐</div>
                        <div className="h2">
                          {reviews.length > 0
                            ? (reviews.reduce((sum, review) => sum + (review.points || 0), 0) / reviews.length).toFixed(1)
                            : '0.0'
                          }
                        </div>
                        <div className="text-muted">Promedio de {reviews.length} reseñas</div>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <h6>Distribución de Calificaciones</h6>
                      {[5, 4, 3, 2, 1].map(stars => {
                        const count = reviews.filter(review => Math.floor(review.points || 0) === stars).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                        return (
                          <div key={stars} className="d-flex align-items-center mb-2">
                            <span className="me-2" style={{ minWidth: '60px' }}>
                              {stars} ⭐
                            </span>
                            <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                              <div
                                className="progress-bar bg-warning"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <small className="text-muted" style={{ minWidth: '40px' }}>
                              {count}
                            </small>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gestión de Categorías de Tienda */}
            <div className="card shadow-sm mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">🏷️ Gestión de Características de la Tienda</h6>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleGetStoreCategories}
                  disabled={loadingStoreCategories}
                >
                  {loadingStoreCategories ? (
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  ) : (
                    '🔄'
                  )} Actualizar
                </button>
              </div>
              <div className="card-body">
                {loadingStoreCategories ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando categorías...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Categorías Disponibles</h6>
                      {availableStoreCategories.length === 0 ? (
                        <div className="alert alert-info">
                          <h6>📋 No hay categorías disponibles</h6>
                          <p className="mb-0">Las categorías son creadas por el administrador del sistema.</p>
                          <small className="text-muted">
                            Contacta al soporte si necesitas nuevas categorías para tu tienda.
                          </small>
                        </div>
                      ) : (
                        <div className="list-group">
                          {availableStoreCategories.map(category => (
                            <div key={category.id} className="list-group-item">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={activeStoreCategories.some(cat => cat.id === category.id)}
                                  onChange={(e) => handleToggleStoreCategory(category.id, e.target.checked)}
                                  id={`config_category_${category.id}`}
                                />
                                <label className="form-check-label" htmlFor={`config_category_${category.id}`}>
                                  <strong>{getCategoryIcon(category.name)} {category.name}</strong>
                                  <br />
                                  <small className="text-muted">{category.description}</small>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <h6>Características Activas ({activeStoreCategories.length})</h6>
                      {activeStoreCategories.length === 0 ? (
                        <div className="alert alert-info">
                          <small>
                            No tienes características activas. Selecciona las que mejor describan tu tienda.
                          </small>
                        </div>
                      ) : (
                        <div className="d-flex flex-wrap gap-2">
                          {activeStoreCategories.map(category => (
                            <span key={category.id} className="badge bg-success fs-6 p-2">
                              {getCategoryIcon(category.name)} {category.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3">
                        <small className="text-muted">
                          💡 <strong>Tip:</strong> Las características ayudan a los usuarios a encontrar tu tienda más fácilmente cuando buscan servicios específicos.
                        </small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
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

                  {/* Agregar Categoría de Producto */}
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <button className="btn btn-primary w-100" onClick={handleAddProductCategory}>
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
                            {productCategories.map(cat => (
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
                      <button type="button" className="btn-close" onClick={() => setEditingItem(null)}></button>
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
                      <button type="button" className="btn btn-secondary" onClick={() => setEditingItem(null)}>
                        Cancelar
                      </button>
                      <button type="button" className="btn btn-success" onClick={handleUpdateItem}>
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Categorías de Productos */}
            <div className="row">
              {productCategories.map(category => (
                <div key={category.id} className="col-12 mb-4">
                  <div className="card shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">{category.name}</h5>
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
                                      <div className="d-flex gap-2">
                                        {/* Botón Editar */}
                                        <button
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={() => handleEditItem(category.id, item.id)}
                                          title="Editar producto"
                                        >
                                          ✏️
                                        </button>
                                        {/* Botón Eliminar */}
                                        <button
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleDeleteItem(category.id, item.id)}
                                          title="Eliminar producto"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="card-text small text-muted">{item.description}</p>
                                  )}
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-success">{formatCurrency(item.price)}</span>

                                    {/* Switch para disponibilidad */}
                                    <div className="d-flex align-items-center gap-2">
                                      <span className="small text-muted">
                                        {item.available ? 'Disponible' : 'No Disponible'}
                                      </span>
                                      <div className="form-check form-switch">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id={`switch-${item.id}`}
                                          checked={item.available}
                                          onChange={() => handleToggleAvailability(category.id, item.id)}
                                          disabled={!editingMenu}
                                        />
                                        <label className="form-check-label" htmlFor={`switch-${item.id}`}>
                                        </label>
                                      </div>
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
                </div>
              ))}
            </div>

            {/* Mensaje si no hay categorías de productos */}
            {productCategories.length === 0 && (
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <h5 className="text-muted">No hay categorías de productos creadas</h5>
                  <p className="text-muted">Comienza agregando una categoría para organizar tus productos</p>
                  {editingMenu && (
                    <div className="row justify-content-center">
                      <div className="col-md-6">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nombre de categoría (ej: BEBIDAS)"
                            value={newProductCategory}
                            onChange={(e) => setNewProductCategory(e.target.value)}
                          />
                          <button className="btn btn-primary" onClick={handleAddProductCategory}>
                            ➕ Crear
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel de información del menú */}
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
                      <small className="text-muted">Categorías de Productos:</small>
                      <div className="fw-bold">{productCategories.length}</div>
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