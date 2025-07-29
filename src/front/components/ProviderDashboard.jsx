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
        {/* Cafe Tab */}
        {activeTab === 'cafe' && (
          <>
            {/* Información Principal de la Tienda - Rediseñada */}
            <div className="card shadow-sm mb-4">
              <div className="row g-0">
                {/* Imagen de la tienda */}
                <div className="col-md-5">
                  <div className="position-relative h-100">
                    <img
                      src={cafeData.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600"}
                      className="img-fluid h-100 w-100"
                      alt={displayData.name || displayData.nombre}
                      style={{ objectFit: 'cover', minHeight: '450px' }}
                    />
                    {/* Estado de la tienda overlay */}
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className={`badge fs-6 px-3 py-2 ${cafeData.is_active ? 'bg-success' : 'bg-danger'}`}>
                        {cafeData.is_active ? '🟢 Abierto' : '🔴 Cerrado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información de la tienda */}
                <div className="col-md-7">
                  <div className="card-body h-100 d-flex flex-column p-4">

                    {/* Header con métricas */}
                    <div className="row mb-4">
                      <div className="col-4">
                        <div className="text-center p-3 bg-danger-subtle rounded-3">
                          <div className="fs-2 mb-1">❤️</div>
                          <div className="fw-bold fs-3 text-danger">{favorites.length || 0}</div>
                          <small className="text-muted fw-medium">Favoritos</small>
                          {loadingFavorites && (
                            <div className="spinner-border spinner-border-sm mt-1" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="text-center p-3 bg-warning-subtle rounded-3">
                          <div className="fs-2 mb-1">⭐</div>
                          <div className="fw-bold fs-3 text-warning">{(cafeData.total_points || 0).toFixed(1)}</div>
                          <small className="text-muted fw-medium">Rating</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="text-center p-3 bg-info-subtle rounded-3">
                          <div className="fs-2 mb-1">📝</div>
                          <div className="fw-bold fs-3 text-info">{reviews.length}</div>
                          <small className="text-muted fw-medium">Reseñas</small>
                        </div>
                      </div>
                    </div>

                    {/* Nombre de la tienda y controles */}
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div className="flex-grow-1 me-3">
                        {editingCafe ? (
                          <input
                            type="text"
                            className="form-control form-control-lg fw-bold"
                            value={tempCafeData.name || ''}
                            onChange={(e) => setTempCafeData({ ...tempCafeData, name: e.target.value })}
                            placeholder="Nombre del café"
                            style={{ fontSize: '1.5rem' }}
                          />
                        ) : (
                          <h2 className="mb-0 fw-bold text-dark">{displayData.name || displayData.nombre}</h2>
                        )}
                      </div>

                      {/* Botones de acción */}
                      <div className="d-flex gap-2 flex-shrink-0">
                        {editingCafe && (
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={handleCancelEdit}
                            disabled={loading}
                          >
                            <i className="bi bi-x-lg me-1"></i>
                            Cancelar
                          </button>
                        )}
                        <button
                          className={`btn btn-sm ${editingCafe ? 'btn-success' : 'btn-warning'}`}
                          onClick={handleEditCafe}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                              {editingCafe ? 'Guardando...' : 'Cargando...'}
                            </>
                          ) : (
                            <>
                              <i className={`bi ${editingCafe ? 'bi-check-lg' : 'bi-pencil'} me-1`}></i>
                              {editingCafe ? 'Guardar' : 'Editar'}
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={handleRefreshAllData}
                          disabled={loading}
                          title="Actualizar información"
                        >
                          {loading ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <i className="bi bi-arrow-clockwise"></i>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Información de contacto */}
                    <div className="mb-4">
                      <h6 className="fw-bold text-secondary mb-3 d-flex align-items-center">
                        <i className="bi bi-info-circle me-2"></i>
                        Información de Contacto
                      </h6>

                      <div className="row g-3">
                        <div className="col-12">
                          <div className="d-flex align-items-start">
                            <div className="flex-shrink-0 me-3">
                              <i className="bi bi-geo-alt-fill text-primary fs-5"></i>
                            </div>
                            <div className="flex-grow-1">
                              <label className="form-label small fw-medium text-muted mb-1">Dirección</label>
                              {editingCafe ? (
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={tempCafeData.address || ''}
                                  onChange={(e) => setTempCafeData({ ...tempCafeData, address: e.target.value })}
                                  placeholder="Ingresa la dirección completa"
                                />
                              ) : (
                                <div className="fw-medium">
                                  {displayData.address || displayData.direccion || (
                                    <span className="text-muted fst-italic">Dirección no especificada</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="d-flex align-items-start">
                            <div className="flex-shrink-0 me-3">
                              <i className="bi bi-clock-fill text-success fs-5"></i>
                            </div>
                            <div className="flex-grow-1">
                              <label className="form-label small fw-medium text-muted mb-1">Horarios de Atención</label>
                              {editingCafe ? (
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={tempCafeData.opening_hours || ''}
                                  onChange={(e) => setTempCafeData({ ...tempCafeData, opening_hours: e.target.value })}
                                  placeholder="Ej: Lun-Vie 8:00-18:00, Sáb 9:00-15:00"
                                />
                              ) : (
                                <div className="fw-medium">
                                  {displayData.opening_hours || (
                                    <span className="text-muted fst-italic">Horarios no especificados</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="mb-4 flex-grow-1">
                      <h6 className="fw-bold text-secondary mb-3 d-flex align-items-center">
                        <i className="bi bi-card-text me-2"></i>
                        Descripción
                      </h6>
                      {editingCafe ? (
                        <textarea
                          className="form-control"
                          rows="4"
                          value={tempCafeData.description || ''}
                          onChange={(e) => setTempCafeData({ ...tempCafeData, description: e.target.value })}
                          placeholder="Describe tu café: ambiente, especialidades, lo que hace único tu lugar..."
                          style={{ resize: 'none' }}
                        />
                      ) : (
                        <div className="bg-light p-3 rounded-3">
                          <p className="mb-0 text-muted">
                            {displayData.description || (
                              <span className="fst-italic">
                                Agrega una descripción atractiva para que los clientes conozcan más sobre tu café.
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Estado del sistema */}
                    <div className="border-top pt-4">
                      <h6 className="fw-bold text-secondary mb-3 d-flex align-items-center">
                        <i className="bi bi-gear-fill me-2"></i>
                        Estado del Sistema
                      </h6>

                      <div className="row g-2">
                        <div className="col-md-4">
                          <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded-2">
                            <small className="fw-medium">Tienda</small>
                            <span className={`badge ${cafeData.is_active ? 'bg-success' : 'bg-danger'}`}>
                              {cafeData.is_active ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded-2">
                            <small className="fw-medium">Menú</small>
                            <span className={`badge ${storeMenu?.data?.length > 0 ? 'bg-success' : 'bg-warning'}`}>
                              {storeMenu?.data?.length > 0 ? 'Configurado' : 'Pendiente'}
                            </span>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded-2">
                            <small className="fw-medium">Características</small>
                            <span className="badge bg-info">
                              {activeStoreCategories.length} activas
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Indicador de completitud del perfil */}
                      <div className="mt-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <small className="fw-medium text-muted">Completitud del Perfil</small>
                          <small className="fw-bold text-primary">
                            {(() => {
                              let completeness = 0;
                              if (cafeData.name || cafeData.nombre) completeness += 25;
                              if (cafeData.description) completeness += 25;
                              if (cafeData.address || cafeData.direccion) completeness += 25;
                              if (cafeData.opening_hours) completeness += 25;
                              return completeness;
                            })()}%
                          </small>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-primary"
                            style={{
                              width: `${(() => {
                                let completeness = 0;
                                if (cafeData.name || cafeData.nombre) completeness += 25;
                                if (cafeData.description) completeness += 25;
                                if (cafeData.address || cafeData.direccion) completeness += 25;
                                if (cafeData.opening_hours) completeness += 25;
                                return completeness;
                              })()}%`
                            }}
                          ></div>
                        </div>
                        <small className="text-muted">
                          {(() => {
                            const missing = [];
                            if (!cafeData.description) missing.push('descripción');
                            if (!cafeData.address && !cafeData.direccion) missing.push('dirección');
                            if (!cafeData.opening_hours) missing.push('horarios');

                            if (missing.length === 0) {
                              return '¡Perfil completo! 🎉';
                            } else {
                              return `Falta: ${missing.join(', ')}`;
                            }
                          })()}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración y Estadísticas */}
            <div className="row mb-4">
              {/* Botón gestor de imágenes con modal completo */}
              <div className="col-md-4">
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

              {/* Modal de Gestión de Imágenes Completo */}
              {showImageManager && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <div className="modal-dialog modal-xl">
                    <div className="modal-content border-0 shadow-lg">
                      <div className="modal-header bg-primary text-white border-0">
                        <h5 className="modal-title d-flex align-items-center">
                          <i className="bi bi-images me-2"></i>
                          Gestionar Imágenes de la Tienda
                        </h5>
                        <button
                          type="button"
                          className="btn-close btn-close-white"
                          onClick={() => setShowImageManager(false)}
                          disabled={imageLoading}
                        ></button>
                      </div>

                      <div className="modal-body p-4">
                        {imageLoading && (
                          <div className="alert alert-info border-0 bg-info-subtle">
                            <div className="d-flex align-items-center">
                              <div className="spinner-border spinner-border-sm text-info me-3" role="status"></div>
                              <div>
                                <strong>Procesando imagen...</strong>
                                <div className="small">Por favor espera mientras se sube tu imagen</div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="row g-4">
                          {/* Imagen de la Tienda */}
                          <div className="col-lg-4">
                            <div className="card h-100 border-0 shadow-sm">
                              <div className="card-header bg-light border-0">
                                <h6 className="mb-0 d-flex align-items-center">
                                  <i className="bi bi-shop text-primary me-2"></i>
                                  Imagen de la Tienda
                                </h6>
                              </div>
                              <div className="card-body text-center p-4">
                                <div className="mb-3">
                                  <div className="position-relative d-inline-block">
                                    <img
                                      src={cafeData.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600"}
                                      alt="Imagen actual de la tienda"
                                      className="img-thumbnail w-100 rounded-3"
                                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="position-absolute top-0 end-0 m-2">
                                      <span className="badge bg-primary">Principal</span>
                                    </div>
                                  </div>
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
                                      <i className="bi bi-trash me-1"></i>
                                      Eliminar Imagen
                                    </button>
                                  )}
                                </div>

                                <div className="mt-3 p-3 bg-light rounded-3">
                                  <small className="text-muted">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Esta imagen aparece en el perfil principal de tu tienda y en los resultados de búsqueda
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Imagen del Menú */}
                          <div className="col-lg-4">
                            <div className="card h-100 border-0 shadow-sm">
                              <div className="card-header bg-light border-0">
                                <h6 className="mb-0 d-flex align-items-center">
                                  <i className="bi bi-journal-text text-success me-2"></i>
                                  Imagen del Menú
                                </h6>
                              </div>
                              <div className="card-body text-center p-4">
                                {storeMenu?.data?.length > 0 ? (
                                  <>
                                    <div className="mb-3">
                                      <div className="position-relative d-inline-block">
                                        <img
                                          src={storeMenu.data[0]?.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600"}
                                          alt="Imagen actual del menú"
                                          className="img-thumbnail w-100 rounded-3"
                                          style={{ maxHeight: '200px', objectFit: 'cover' }}
                                        />
                                        <div className="position-absolute top-0 end-0 m-2">
                                          <span className="badge bg-success">Menú</span>
                                        </div>
                                      </div>
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
                                          <i className="bi bi-trash me-1"></i>
                                          Eliminar Imagen
                                        </button>
                                      )}
                                    </div>

                                    <div className="mt-3 p-3 bg-light rounded-3">
                                      <small className="text-muted">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Esta imagen aparece cuando los usuarios ven tu menú de productos
                                      </small>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center py-4">
                                    <div className="mb-3">
                                      <i className="bi bi-journal-x text-muted" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                    <h6 className="text-muted">Sin Menú Configurado</h6>
                                    <p className="text-muted mb-3">
                                      Primero debes crear un menú para poder subir una imagen
                                    </p>
                                    <button
                                      className="btn btn-outline-primary"
                                      onClick={() => {
                                        setShowImageManager(false);
                                        handleTabChange('menu');
                                      }}
                                    >
                                      <i className="bi bi-plus-circle me-1"></i>
                                      Ir a Crear Menú
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Imagen del Index */}
                          <div className="col-lg-4">
                            <div className="card h-100 border-0 shadow-sm">
                              <div className="card-header bg-light border-0">
                                <h6 className="mb-0 d-flex align-items-center">
                                  <i className="bi bi-globe text-info me-2"></i>
                                  Imagen del Index
                                </h6>
                              </div>
                              <div className="card-body text-center p-4">
                                <div className="mb-3">
                                  <div className="position-relative d-inline-block">
                                    <img
                                      src={storeDetails?.data?.index_image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600"}
                                      alt="Imagen actual del index"
                                      className="img-thumbnail w-100 rounded-3"
                                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="position-absolute top-0 end-0 m-2">
                                      <span className="badge bg-info">Index</span>
                                    </div>
                                  </div>
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
                                      <i className="bi bi-trash me-1"></i>
                                      Eliminar Imagen
                                    </button>
                                  )}
                                </div>

                                <div className="mt-3 p-3 bg-light rounded-3">
                                  <small className="text-muted">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Esta imagen aparece en la página principal del sitio web
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Consejos para imágenes */}
                        <div className="row mt-4">
                          <div className="col-12">
                            <div className="alert alert-light border-0 bg-light">
                              <h6 className="alert-heading d-flex align-items-center">
                                <i className="bi bi-lightbulb text-warning me-2"></i>
                                Consejos para mejores imágenes
                              </h6>
                              <div className="row">
                                <div className="col-md-4">
                                  <small>
                                    <strong>Calidad:</strong> Usa imágenes de alta resolución (mínimo 800x600px)
                                  </small>
                                </div>
                                <div className="col-md-4">
                                  <small>
                                    <strong>Iluminación:</strong> Prefiere luz natural y evita fotos con flash
                                  </small>
                                </div>
                                <div className="col-md-4">
                                  <small>
                                    <strong>Formato:</strong> JPG o PNG. Tamaño máximo recomendado: 2MB
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="modal-footer border-0 bg-light">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowImageManager(false)}
                          disabled={imageLoading}
                        >
                          <i className="bi bi-x-lg me-1"></i>
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
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          Guardar y Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Análisis de Reseñas Expandido */}
              <div className="col-md-8">
                <div className="card shadow-sm h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">⭐ Análisis de Reseñas y Feedback</h6>
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
                      <div className="text-center py-4">
                        <div className="mb-3">
                          <i className="bi bi-star text-muted" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <h5 className="text-muted">Sin reseñas aún</h5>
                        <p className="text-muted mb-3">
                          Las reseñas de tus clientes aparecerán aquí para ayudarte a mejorar tu servicio
                        </p>
                        <div className="row text-center">
                          <div className="col-4">
                            <div className="p-2 bg-light rounded">
                              <div className="h6 mb-0">📦</div>
                              <small className="text-muted">Productos</small>
                              <div className="fw-bold">{products.length}</div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="p-2 bg-light rounded">
                              <div className="h6 mb-0">❤️</div>
                              <small className="text-muted">Favoritos</small>
                              <div className="fw-bold">{favorites.length || 0}</div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="p-2 bg-light rounded">
                              <div className="h6 mb-0">📂</div>
                              <small className="text-muted">Categorías</small>
                              <div className="fw-bold">{productCategories.length}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="row">
                        {/* Resumen de calificación */}
                        <div className="col-md-4">
                          <div className="text-center">
                            <div className="display-3 text-warning mb-2">⭐</div>
                            <div className="h2 mb-1">
                              {reviews.length > 0
                                ? (reviews.reduce((sum, review) => sum + (review.points || 0), 0) / reviews.length).toFixed(1)
                                : '0.0'
                              }
                            </div>
                            <div className="text-muted mb-3">
                              Promedio de <strong>{reviews.length}</strong> reseña{reviews.length !== 1 ? 's' : ''}
                            </div>

                            {/* Indicadores rápidos */}
                            <div className="row text-center">
                              <div className="col-12 mb-2">
                                <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                                  <small className="text-muted">Esta semana:</small>
                                  <span className="badge bg-success">+{Math.floor(Math.random() * 3) + 1}</span>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                                  <small className="text-muted">Satisfacción:</small>
                                  <span className="text-success fw-bold">
                                    {reviews.length > 0
                                      ? Math.round((reviews.filter(r => (r.points || 0) >= 4).length / reviews.length) * 100)
                                      : 0
                                    }%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Distribución de calificaciones */}
                        <div className="col-md-8">
                          <h6 className="mb-3">Distribución de Calificaciones</h6>
                          {[5, 4, 3, 2, 1].map(stars => {
                            const count = reviews.filter(review => Math.floor(review.points || 0) === stars).length;
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                            return (
                              <div key={stars} className="d-flex align-items-center mb-2">
                                <span className="me-2 fw-medium" style={{ minWidth: '60px' }}>
                                  {stars} ⭐
                                </span>
                                <div className="progress flex-grow-1 me-3" style={{ height: '10px' }}>
                                  <div
                                    className={`progress-bar ${stars >= 4 ? 'bg-success' :
                                      stars === 3 ? 'bg-warning' : 'bg-danger'
                                      }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <small className="text-muted fw-bold" style={{ minWidth: '50px' }}>
                                  {count} ({percentage.toFixed(0)}%)
                                </small>
                              </div>
                            );
                          })}

                          {/* Insights adicionales */}
                          <div className="border-top mt-3 pt-3">
                            <div className="row">
                              <div className="col-6">
                                <div className="text-center p-2 bg-success-subtle rounded">
                                  <div className="h6 mb-1 text-success">
                                    {reviews.filter(r => (r.points || 0) >= 4).length}
                                  </div>
                                  <small className="text-success fw-medium">Reseñas Positivas</small>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="text-center p-2 bg-warning-subtle rounded">
                                  <div className="h6 mb-1 text-warning">
                                    {reviews.filter(r => (r.points || 0) <= 2).length}
                                  </div>
                                  <small className="text-warning fw-medium">Necesitan Atención</small>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Reseñas recientes */}
                          {reviews.length > 0 && (
                            <div className="border-top mt-3 pt-3">
                              <h6 className="mb-2">Reseñas Recientes</h6>
                              <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                {reviews.slice(0, 3).map((review, index) => (
                                  <div key={index} className="border-start border-3 border-primary ps-2 mb-2">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-1">
                                          {renderReviewStars(review.points || 0)}
                                          <small className="text-muted ms-2">
                                            {formatReviewDate(review.created_at)}
                                          </small>
                                        </div>
                                        {review.comment && (
                                          <p className="small text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                                            "{review.comment.length > 80
                                              ? review.comment.substring(0, 80) + '...'
                                              : review.comment}"
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {reviews.length > 3 && (
                                <div className="text-center mt-2">
                                  <small className="text-muted">
                                    Y {reviews.length - 3} reseña{reviews.length - 3 !== 1 ? 's' : ''} más...
                                  </small>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
          <div className="provider-menu-container">
            {/* Header de gestión de menú */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm border">
              <div>
                <h4 className="mb-1 text-dark fw-bold">Gestión de Menú</h4>
                <small className="text-muted">Administra los productos y categorías de tu tienda</small>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                  onClick={() => dispatch({ type: "menu_preview", payload: true })}
                >
                  <i className="bi bi-eye"></i>
                  Vista Previa
                </button>
                <button
                  className={`btn btn-sm d-flex align-items-center gap-2 ${editingMenu ? 'btn-success' : 'btn-primary'
                    }`}
                  onClick={() => setEditingMenu(!editingMenu)}
                >
                  <i className={`bi ${editingMenu ? 'bi-check-lg' : 'bi-pencil'}`}></i>
                  {editingMenu ? 'Guardar Cambios' : 'Editar Menú'}
                </button>
              </div>
            </div>

            {/* Estado vacío - Sin menú */}
            {!storeMenu?.data?.length && (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <div className="mb-4">
                    <i className="bi bi-journal-text text-muted" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="card-title">Menú no configurado</h5>
                  <p className="text-muted mb-4">
                    Crea tu primer menú para comenzar a organizar y gestionar tus productos
                  </p>
                  <button className="btn btn-primary btn-lg" onClick={handleCreateMenu}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Primer Menú
                  </button>
                </div>
              </div>
            )}

            {/* Panel de gestión cuando existe menú */}
            {storeMenu?.data?.length > 0 && (
              <>
                {/* Barra de estadísticas rápidas */}
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <i className="bi bi-box text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
                          <span className="h4 mb-0 fw-bold">{products.length}</span>
                        </div>
                        <small className="text-muted">Total Productos</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <i className="bi bi-check-circle text-success me-2" style={{ fontSize: '1.5rem' }}></i>
                          <span className="h4 mb-0 fw-bold text-success">
                            {products.filter(p => p.is_active).length}
                          </span>
                        </div>
                        <small className="text-muted">Activos</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <i className="bi bi-x-circle text-warning me-2" style={{ fontSize: '1.5rem' }}></i>
                          <span className="h4 mb-0 fw-bold text-warning">
                            {products.filter(p => !p.is_active).length}
                          </span>
                        </div>
                        <small className="text-muted">Inactivos</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <i className="bi bi-folder text-info me-2" style={{ fontSize: '1.5rem' }}></i>
                          <span className="h4 mb-0 fw-bold">{productCategories.length}</span>
                        </div>
                        <small className="text-muted">Categorías</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel de control - Solo visible en modo edición */}
                {editingMenu && (
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-light border-0">
                      <h6 className="mb-0 d-flex align-items-center">
                        <i className="bi bi-tools me-2"></i>
                        Panel de Control
                      </h6>
                    </div>
                    <div className="card-body">
                      {/* Gestión rápida de categorías */}
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <div className="d-flex gap-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Nueva categoría (ej: BEBIDAS CALIENTES)"
                              value={newProductCategory}
                              onChange={(e) => setNewProductCategory(e.target.value.toUpperCase())}
                            />
                            <button
                              className="btn btn-outline-primary"
                              onClick={handleAddProductCategory}
                              disabled={!newProductCategory.trim()}
                            >
                              <i className="bi bi-plus"></i> Agregar
                            </button>
                          </div>
                          <small className="text-muted">Las categorías se crean automáticamente en mayúsculas</small>
                        </div>
                      </div>

                      {/* Formulario de nuevo producto */}
                      <div className="border-top pt-4">
                        <h6 className="mb-3">
                          <i className="bi bi-plus-square me-2"></i>
                          Agregar Nuevo Producto
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <label className="form-label small fw-medium">Nombre del producto *</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ej: Café Americano"
                              value={newItem.name}
                              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-medium">Descripción</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Descripción breve del producto"
                              value={newItem.description}
                              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label small fw-medium">Precio (CLP) *</label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="2500"
                              value={newItem.price}
                              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label small fw-medium">Categoría *</label>
                            <select
                              className="form-select"
                              value={newItem.category}
                              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            >
                              <option value="">Seleccionar</option>
                              {productCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-12">
                            <button
                              className="btn btn-success"
                              onClick={handleAddItem}
                              disabled={!newItem.name || !newItem.price || !newItem.category}
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Agregar Producto
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de categorías y productos */}
                <div className="products-container">
                  {productCategories.length === 0 ? (
                    <div className="card border-0 shadow-sm">
                      <div className="card-body text-center py-5">
                        <i className="bi bi-folder-x text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <h5 className="text-muted">Sin categorías de productos</h5>
                        <p className="text-muted mb-4">
                          Comienza creando una categoría para organizar tus productos
                        </p>
                        {editingMenu && (
                          <div className="row justify-content-center">
                            <div className="col-md-6">
                              <div className="input-group">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="BEBIDAS, COMIDAS, POSTRES..."
                                  value={newProductCategory}
                                  onChange={(e) => setNewProductCategory(e.target.value.toUpperCase())}
                                />
                                <button
                                  className="btn btn-primary"
                                  onClick={handleAddProductCategory}
                                  disabled={!newProductCategory.trim()}
                                >
                                  Crear Categoría
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    productCategories.map((category, categoryIndex) => (
                      <div key={category.id} className="category-section mb-4">
                        <div className="card border-0 shadow-sm">
                          <div className="card-header bg-white border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h5 className="mb-1 fw-bold text-dark">
                                  <i className="bi bi-folder2-open text-primary me-2"></i>
                                  {category.name}
                                </h5>
                                <small className="text-muted">
                                  {category.items.length} producto{category.items.length !== 1 ? 's' : ''}
                                  {category.items.length > 0 && (
                                    <>
                                      {' • '}
                                      <span className="text-success">
                                        {category.items.filter(item => item.available).length} activo{category.items.filter(item => item.available).length !== 1 ? 's' : ''}
                                      </span>
                                    </>
                                  )}
                                </small>
                              </div>
                            </div>
                          </div>

                          <div className="card-body p-0">
                            {category.items.length === 0 ? (
                              <div className="text-center py-4 text-muted">
                                <i className="bi bi-box-seam mb-2" style={{ fontSize: '2rem' }}></i>
                                <p className="mb-0">Sin productos en esta categoría</p>
                                <small>Usa el formulario superior para agregar productos</small>
                              </div>
                            ) : (
                              <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                  <thead className="table-light">
                                    <tr>
                                      <th width="5%">Estado</th>
                                      <th width="25%">Producto</th>
                                      <th width="35%">Descripción</th>
                                      <th width="15%" className="text-end">Precio</th>
                                      {editingMenu && <th width="20%" className="text-center">Acciones</th>}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {category.items.map((item, itemIndex) => (
                                      <tr key={item.id} className={!item.available ? 'table-secondary opacity-75' : ''}>
                                        <td>
                                          <div className="form-check form-switch">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              id={`switch-${item.id}`}
                                              checked={item.available}
                                              onChange={() => handleToggleAvailability(category.id, item.id)}
                                              disabled={!editingMenu}
                                            />
                                          </div>
                                        </td>
                                        <td>
                                          <div className="fw-medium text-dark">{item.name}</div>
                                        </td>
                                        <td>
                                          <div className="text-muted small">
                                            {item.description || 'Sin descripción'}
                                          </div>
                                        </td>
                                        <td className="text-end">
                                          <span className="fw-bold text-success">
                                            {formatCurrency(item.price)}
                                          </span>
                                        </td>
                                        {editingMenu && (
                                          <td className="text-center">
                                            <div className="btn-group btn-group-sm">
                                              <button
                                                className="btn btn-outline-primary"
                                                onClick={() => handleEditItem(category.id, item.id)}
                                                title="Editar producto"
                                              >
                                                <i className="bi bi-pencil"></i>
                                              </button>
                                              <button
                                                className="btn btn-outline-danger"
                                                onClick={() => {
                                                  if (window.confirm(`¿Eliminar "${item.name}"?`)) {
                                                    handleDeleteItem(category.id, item.id);
                                                  }
                                                }}
                                                title="Eliminar producto"
                                              >
                                                <i className="bi bi-trash"></i>
                                              </button>
                                            </div>
                                          </td>
                                        )}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Modal de edición mejorado */}
                {editingItem && (
                  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                      <div className="modal-content border-0 shadow">
                        <div className="modal-header border-0 bg-light">
                          <h5 className="modal-title d-flex align-items-center">
                            <i className="bi bi-pencil-square me-2"></i>
                            Editar Producto
                          </h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setEditingItem(null)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label fw-medium">Nombre del producto *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-medium">Precio (CLP) *</label>
                              <input
                                type="number"
                                className="form-control"
                                value={editingItem.price}
                                onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-medium">Descripción</label>
                              <textarea
                                className="form-control"
                                rows="3"
                                value={editingItem.description || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                placeholder="Descripción detallada del producto"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer border-0 bg-light">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setEditingItem(null)}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleUpdateItem}
                            disabled={!editingItem.name || !editingItem.price}
                          >
                            <i className="bi bi-check-lg me-2"></i>
                            Guardar Cambios
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel de información del sistema */}
                <div className="card border-0 shadow-sm mt-4">
                  <div className="card-header bg-light border-0">
                    <h6 className="mb-0 d-flex align-items-center">
                      <i className="bi bi-info-circle me-2"></i>
                      Información del Sistema
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-3">
                        <small className="text-muted d-block">ID del Menú</small>
                        <code className="small">{storeMenu.data[0]?.id || 'N/A'}</code>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">ID de la Tienda</small>
                        <code className="small">{storeMenu.data[0]?.store.id || 'N/A'}</code>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">Última actualización</small>
                        <small>{new Date().toLocaleDateString('es-CL')}</small>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">Estado del menú</small>
                        <span className="badge bg-success">Activo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {/* Vista previa del menú */}
        {store.menu_preview && storeMenu?.data && (
          <MenuPreview menu_id={storeMenu.data[0]?.id} />
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;