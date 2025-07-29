import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { getStoreMenu } from "../services/api_menu";
import QrCode from './QrCode.jsx';

const MenuPreview = ({ menu_id = null }) => {
  const { store, dispatch } = useGlobalReducer();
  const [menuCategories, setMenuCategories] = useState([]);
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "Café Central",
    logo: null,
    backgroundImage: null
  });
  const [menuId, setMenuId] = useState(menu_id);
  const { id } = useParams();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  useEffect(() => {
    const fetchMenu = async () => {
      let realMenuId = menu_id ? menu_id : id;
      setMenuId(realMenuId);
      if (!store.token) return;
      const res = await getStoreMenu(store.token);
      if (res && res.ok && res.data && res.data.length > 0) {
        const menu = res.data.find(m => m.id === Number(realMenuId)) || res.data[0];
        if (menu) {
          const categoriesMap = {};
          if (menu.products && Array.isArray(menu.products)) {
            menu.products.forEach(product => {
              const cat = product.category || "SIN CATEGORÍA";
              if (!categoriesMap[cat]) {
                categoriesMap[cat] = {
                  id: cat,
                  name: cat,
                  items: []
                };
              }
              categoriesMap[cat].items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                available: product.is_active
              });
            });
            setMenuCategories(Object.values(categoriesMap));
          } else {
            setMenuCategories([]);
          }
          setRestaurantInfo({
            name: menu.store?.name || menu.store?.nombre || "Café Central",
            logo: menu.store?.logo_url || null,
            backgroundImage: menu.store?.background_url || null
          });
        }
      }
    };
    fetchMenu();
  }, [store.token, menu_id, id]);

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content"
          style={{
            background: 'linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)',
            color: '#78350f',
            borderRadius: '15px',
            border: 'none'
          }}>

          {/* Header elegante */}
          <div className="modal-header border-0 position-relative"
            style={{
              background: 'linear-gradient(90deg, #fce8d9 0%, #f4d1ae 100%)',
              borderRadius: '15px 15px 0 0',
              borderBottom: '2px solid #d4a574'
            }}>
            <div className="container-fluid text-center" style={{ color: '#78350f' }}>
              {restaurantInfo.logo && (
                <img src={restaurantInfo.logo}
                  alt="Logo"
                  className="mb-2 border border-3"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    borderColor: '#d4a574 !important',
                    boxShadow: '0 4px 15px rgba(212, 165, 116, 0.3)'
                  }} />
              )}
              <h1 className="display-3 fw-bold mb-2"
                style={{
                  fontFamily: 'serif',
                  textShadow: '2px 2px 4px rgba(212, 165, 116, 0.3)',
                  letterSpacing: '3px',
                  color: '#78350f'
                }}>
                MENÚ
              </h1>
              <h4 className="fw-light" style={{ opacity: 0.8, color: '#8b4513' }}>
                {restaurantInfo.name}
              </h4>
            </div>

            <button
              className="btn-close position-absolute"
              style={{
                top: '15px',
                right: '15px',
                fontSize: '1.2rem',
                filter: 'invert(0.3)'
              }}
              onClick={() => dispatch({ type: "menu_preview", payload: false })}>
            </button>
          </div>

          {/* Body del menú */}
          <div className="modal-body p-4">
            <div className="container-fluid">
              <div className="row g-4">
                {menuCategories.map((category, index) => (
                  <div key={category.id} className="col-lg-6">
                    <div className="card h-100 border-0 shadow-sm"
                      style={{
                        background: 'linear-gradient(145deg, #fff 0%, #faf7f2 100%)',
                        borderRadius: '12px',
                        border: '1px solid #e8d5c4'
                      }}>

                      {/* Header de categoría */}
                      <div className="card-header text-center border-0 py-3"
                        style={{
                          background: 'linear-gradient(90deg, #fce8d9 0%, #f4d1ae 100%)',
                          borderRadius: '12px 12px 0 0',
                          borderBottom: '1px solid #e8d5c4'
                        }}>
                        <h5 className="fw-bold mb-0"
                          style={{
                            letterSpacing: '1.5px',
                            fontSize: '1.1rem',
                            color: '#78350f'
                          }}>
                          {category.name}
                        </h5>
                      </div>

                      {/* Items de la categoría */}
                      <div className="card-body p-3">
                        {category.items.length > 0 ? (
                          category.items.map((item, itemIndex) => (
                            <div key={item.id}
                              className={`row align-items-center py-2 ${itemIndex !== category.items.length - 1 ? 'border-bottom' : ''}`}
                              style={{ borderColor: '#e8d5c4' }}>
                              <div className="col-8">
                                <span className={`fw-medium ${item.available ? 'text-dark' : 'text-muted text-decoration-line-through'}`}
                                  style={{ fontSize: '0.95rem' }}>
                                  {item.name}
                                </span>
                                {!item.available && (
                                  <small className="d-block text-danger fst-italic">
                                    No disponible
                                  </small>
                                )}
                              </div>
                              <div className="col-4 text-end">
                                <span className={`fw-bold ${item.available ? '' : 'text-muted'}`}
                                  style={{
                                    fontSize: '0.9rem',
                                    color: item.available ? '#8b4513' : undefined
                                  }}>
                                  {formatCurrency(item.price)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <i className="fas fa-utensils mb-2"
                              style={{ fontSize: '2rem', color: '#d4a574' }}></i>
                            <p className="text-muted fst-italic mb-0">Sin productos disponibles</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer elegante */}
          {/* <div className="modal-footer border-0 flex-column"
            style={{
              background: 'linear-gradient(90deg, #fce8d9 0%, #f4d1ae 100%)',
              borderRadius: '0 0 15px 15px',
              borderTop: '2px solid #d4a574'
            }}>

            <div className="text-center mb-3" style={{ color: '#78350f' }}>
              <h6 className="fw-bold mb-2" style={{ letterSpacing: '1px' }}>
                <i className="fas fa-utensils me-2"></i>
                DISPONIBLE EN TU MESA
              </h6>
              <p className="mb-2 fw-light" style={{ color: '#8b4513' }}>
                <i className="fas fa-phone me-2"></i>
                312-692-6732
              </p>
              <p className="mb-3 fw-light" style={{ color: '#8b4513' }}>
                <i className="fas fa-globe me-2"></i>
                www.companyname.com
              </p>
            </div>

            <div className="text-center">
              <div className="d-inline-block p-3 bg-white rounded-3 shadow-sm border"
                style={{ borderColor: '#d4a574' }}>
                <QrCode id_menu={menuId} />
              </div>
              <p className="mt-2 mb-0 small fw-light" style={{ color: '#8b4513' }}>
                Escanea para ver el menú digital
              </p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default MenuPreview;