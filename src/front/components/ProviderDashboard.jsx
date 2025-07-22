import React, { useEffect, useState } from 'react';
import { getStoreDetail } from "../services/api_store";
import { getStoreMenu } from "../services/api_menu";
import { useParams } from 'react-router-dom';
import MenuPreview from "./MenuPreview.jsx"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import Cloudinary from './Cloudinary.jsx';


const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('cafe');
  const [showProfile, setShowProfile] = useState(false);
  const [editingMenu, setEditingMenu] = useState(false);
  const [menuPreview, setMenuPreview] = useState(false);
  const { id } = useParams();   //validar ID
  const [storeDetails, setStoreDetails] = useState("");
  const [storeMenu, setStoreMenu] = useState("");
  const { store, dispatch } = useGlobalReducer();
  // Estado para la información del restaurante
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "Café Central",
    logo: null,
    backgroundImage: null
  });

  const provider = {
    name: "Carlos Mendoza",
    email: "carlos@cafcentral.com",
    avatar: "/api/placeholder/40/40",
    cafeName: "Café Central",
    memberSince: "2024",
    paymentStatus: "active"
  };

  const cafeData = {
    id: 1,
    name: "Café Central",
    rating: 4.5,
    location: "Av. Providencia 1234, Santiago",
    tags: ["TACC", "pet-friendly", "wifi"],
    description: "Ambiente acogedor con especialidad en café de origen y repostería artesanal, buena atención y servicio al cliente con espacios de lectura y zona de fumadores.",
    favorites: 89,
    isOpen: true,
    openingHours: "Lun-Vie: 7:00-20:00, Sáb-Dom: 8:00-21:00"
  };

  // Estado inicial del menú con categorías
  const [menuCategories, setMenuCategories] = useState([
    {
      id: 1,
      name: "BEBIDAS CALIENTES",
      items: [
        { id: 1, name: "Cappuccino", price: 3500, available: true },
        { id: 2, name: "Latte", price: 3200, available: true },
        { id: 3, name: "Espresso", price: 2500, available: true },
        { id: 4, name: "Americano", price: 2800, available: true }
      ]
    },
    {
      id: 2,
      name: "BEBIDAS FRÍAS",
      items: [
        { id: 5, name: "Frappé", price: 4000, available: true },
        { id: 6, name: "Iced Latte", price: 3500, available: true }
      ]
    },
    {
      id: 3,
      name: "REPOSTERÍA",
      items: [
        { id: 7, name: "Croissant", price: 2800, available: true },
        { id: 8, name: "Muffin", price: 2500, available: true }
      ]
    },
    {
      id: 4,
      name: "POSTRES",
      items: [
        { id: 9, name: "Cheesecake", price: 4200, available: false },
        { id: 10, name: "Tiramisú", price: 4500, available: true }
      ]
    }
  ]);

  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '', categoryId: null });

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

  const getTagIcon = (tag) => {
    const icons = {
      'TACC': '🛡️',
      'pet-friendly': '🐕',
      'zona-fumadores': '🚬',
      'espacios-azules': '💧',
      'wifi': '📶'
    };
    return icons[tag] || '🏷️';
  };

  const getTagColor = (tag) => {
    const colors = {
      'TACC': 'warning',
      'pet-friendly': 'success',
      'zona-fumadores': 'secondary',
      'espacios-azules': 'info',
      'wifi': 'primary'
    };
    return colors[tag] || 'secondary';
  };

  // Funciones para manejar el menú
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setMenuCategories([...menuCategories, {
        id: Date.now(),
        name: newCategory.toUpperCase(),
        items: []
      }]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (categoryId) => {
    setMenuCategories(menuCategories.filter(cat => cat.id !== categoryId));
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.price && newItem.categoryId) {
      const updatedCategories = menuCategories.map(cat => {
        if (cat.id === parseInt(newItem.categoryId)) {
          return {
            ...cat,
            items: [...cat.items, {
              id: Date.now(),
              name: newItem.name,
              price: parseInt(newItem.price),
              available: true
            }]
          };
        }
        return cat;
      });
      setMenuCategories(updatedCategories);
      setNewItem({ name: '', price: '', categoryId: null });
    }
  };

  const handleDeleteItem = (categoryId, itemId) => {
    const updatedCategories = menuCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.filter(item => item.id !== itemId)
        };
      }
      return cat;
    });
    setMenuCategories(updatedCategories);
  };

  const handleToggleAvailability = (categoryId, itemId) => {
    const updatedCategories = menuCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => {
            if (item.id === itemId) {
              return { ...item, available: !item.available };
            }
            return item;
          })
        };
      }
      return cat;
    });
    setMenuCategories(updatedCategories);
  };
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRestaurantInfo({
          ...restaurantInfo,
          [type]: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
   const handleGetStoreDetail= async()=>{
      setStoreDetails(await getStoreDetail(id))
   }
   const handleGetStoreMenu= async()=>{
      setStoreMenu(await getStoreMenu(store.token))
   }
   useEffect(() => {
      handleGetStoreDetail();// Ejemplo para obtener detalle de la tienda de back
      handleGetStoreMenu();// Ejemplo para obtener menu de la tienda de back
    }, []);

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#FFF5EB' }}>
      {/* Navbar del Proveedor */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <i className="fas fa-coffee me-2" style={{ fontSize: '1.4rem', color: '#8b4513' }}></i>
            <div>
              <h5 className="mb-0 fw-bold">Panel Proveedor</h5>
              <small className="text-muted">{storeDetails.data ? storeDetails.data.name : cafeData.name } </small>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <span className={`badge me-3 ${provider.paymentStatus === 'active' ? 'bg-success' : 'bg-danger'}`}>
              {provider.paymentStatus === 'active' ? 'Activo' : 'Inactivo'}
            </span>

            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle d-flex align-items-center"
                onClick={() => setShowProfile(!showProfile)}
              >
                <img
                  src={provider.avatar}
                  alt="Avatar"
                  className="rounded-circle me-2"
                  width="32" height="32"
                />
                {provider.name}
              </button>

              {showProfile && (
                <div className="dropdown-menu dropdown-menu-end show">
                  <div className="dropdown-header">
                    <strong>{provider.name}</strong><br />
                    <small>{provider.email}</small><br />
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item">👤 Mi Perfil</button>
                  <button className="dropdown-item">⚙️ Configuración</button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger">🚪 Cerrar Sesión</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Navigation Tabs */}
      <div className="bg-white border-bottom">
        <div className="container-fluid">
          <ul className="nav nav-tabs border-0">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'cafe' ? 'active' : ''}`}
                onClick={() => setActiveTab('cafe')}
              >
                <i className="fas fa-coffee me-2" style={{ fontSize: '1.4rem', color: '#8b4513' }}></i> Mi Cafetería
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                📋 Menú
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4">
        {/* Cafe Tab */}
        {activeTab === 'cafe' && (
          <div className="card shadow-sm">
            <div className="row g-0">
              <div className="col-md-5">
                <img
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600"
                  className="img-fluid h-100 w-100"
                  alt={cafeData.name}
                  style={{ objectFit: 'cover', minHeight: '400px' }}
                />
              </div>
              <div className="col-md-7">
                <div className="card-body h-100 d-flex flex-column">
                  <div className="row mb-4">
                    <div className="col-6">
                      <div className="text-center p-3 bg-danger-subtle">
                        <div className="fs-3">❤️</div>
                        <div className="fw-bold fs-4">{cafeData.favorites}</div>
                        <small className="text-muted">Favoritos</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-3 bg-warning-subtle">
                        <div className="fs-3">⭐</div>
                        <div className="fw-bold fs-4">{cafeData.rating}</div>
                        <small className="text-muted">Rating</small>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h3 className="mb-2">{cafeData.name}</h3>
                      <div className="d-flex align-items-center mb-2">
                        {renderStars(cafeData.rating)}
                        <span className="ms-2 text-muted">{cafeData.rating}</span>
                      </div>
                      <div className="text-muted mb-2">
                        🕒 {cafeData.openingHours}
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
                        <small className="text-muted">📍 {cafeData.location}</small>
                      </div>
                      <span className={`badge ${cafeData.isOpen ? 'bg-success' : 'bg-danger'}`}>
                        {cafeData.isOpen ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <h6>Características</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {cafeData.tags.map(tag => (
                          <span key={tag} className={`badge bg-${getTagColor(tag)}`}>
                            {getTagIcon(tag)} {tag.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h6>Descripción</h6>
                    <p className="text-muted mb-0">{cafeData.description}</p>
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

            {/* Editor de Menú */}
            {editingMenu && (
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-4">Editor de Menú</h5>

                  {/* Carga de imágenes */}
                  <div className="row mb-4">
                     <div className="col-md-6">
                      {storeMenu.data[0].id && (<Cloudinary preset="width100" image_type="menu" owner_id={storeMenu.data[0].id} /> )}
                     </div>
                    {/* Nombre de Tienda */}
                    <div className="col-md-6">
                      <label className="form-label">Nombre de la Tienda</label>
                      <input
                        type="text"
                        className="form-control"
                        value={restaurantInfo.name}
                        onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Agregar Categoría */}
                  <div className="mb-4">
                    <h6>Agregar Categoría</h6>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nombre de la categoría"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                      <button className="btn btn-outline-primary" onClick={handleAddCategory}>
                        ➕ Agregar Categoría
                      </button>
                    </div>
                  </div>

                  {/* Agregar Producto */}
                  <div className="mb-4">
                    <h6>Agregar Producto</h6>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <select
                          className="form-select"
                          value={newItem.categoryId || ''}
                          onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                        >
                          <option value="">Seleccionar categoría</option>
                          {menuCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nombre del producto"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
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
                        <button className="btn btn-primary w-100" onClick={handleAddItem}>
                          ➕ Agregar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Categorías y Productos */}
                  <h6 className="mb-3">Categorías y Productos</h6>
                  {menuCategories.map(category => (
                    <div key={category.id} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-primary mb-0">{category.name}</h6>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          🗑️ Eliminar Categoría
                        </button>
                      </div>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Precio</th>
                              <th>Estado</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.items.map(item => (
                              <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{formatCurrency(item.price)}</td>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={item.available}
                                      onChange={() => handleToggleAvailability(category.id, item.id)}
                                    />
                                    <label className="form-check-label">
                                      {item.available ? 'Disponible' : 'No Disponible'}
                                    </label>
                                  </div>
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteItem(category.id, item.id)}
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {category.items.length === 0 && (
                              <tr>
                                <td colSpan="4" className="text-center text-muted">
                                  Sin productos en esta categoría
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabla de productos actual */}
            <div className="card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuCategories.flatMap(category =>
                      category.items.map(item => (
                        <tr key={item.id}>
                          <td className="fw-semibold">{item.name}</td>
                          <td className="text-muted">{category.name}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>
                            <span className={`badge ${item.available ? 'bg-success' : 'bg-danger'}`}>
                              {item.available ? 'Disponible' : 'No Disponible'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => setEditingMenu(true)}
                            >
                              ✏️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Vista previa del menú */}
       {store.menu_preview && storeMenu.data && <MenuPreview menu_id={storeMenu.data[0].id}/>}
       { storeDetails && ( 
        <div>Ejemplo para obtener listado de la tienda de back 
        <pre style={{ background: '#eee', padding: '1em', marginTop: '1em' }}>
        {JSON.stringify(storeDetails.data, null, 2) }
        </pre>
      </div>)}
       { storeMenu ? ( 
        <div>Ejemplo para obtener Menu de la tienda de back 
        <pre style={{ background: '#eee', padding: '1em', marginTop: '1em' }}>
        {JSON.stringify(storeMenu.data, null, 2) }
        </pre>
      </div>) : (JSON.stringify(storeMenu.msg, null, 2)) }
    </div>
  );
};

export default ProviderDashboard;