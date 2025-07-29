import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { getFrontStoreMenu } from "../services/api_menu";
import QrCode from './QrCode.jsx';

const CafeMenu = ({ store_id = null }) => {
  const { store, dispatch } = useGlobalReducer();
  const [menuCategories, setMenuCategories] = useState([]);
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "Café Central",
    logo: null,
    backgroundImage: null
  });
  const [menuId, setMenuId] = useState(store_id);
  const { id } = useParams();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };
  const fetchMenu = async () => {
    let realMenuId = store_id ? store_id : id;
    setMenuId(realMenuId);
    const res = await getFrontStoreMenu(realMenuId);
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
          logo: menu.images?.url || null,
          backgroundImage: menu.store?.background_url || null
        });
      }
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [store_id, id]);

 return (
<div className="modal show d-block" style={{ backgroundColor: '#4a3524', overflow: 'hidden' }}>
  <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxHeight: '100vh', overflow: 'hidden' }}>
    <div className="modal-content" style={{
      backgroundColor: '#f5ebdc',
      color: '#4a3524',
      borderRadius: '0',
      border: '2px solid #8b4513',
      maxWidth: '800px',
      margin: '0 auto',
      overflow: 'hidden' 
    }}>

      {/* Header con logo a la izquierda y título centrado */}
      <div className="modal-header border-0 py-4" style={{
        borderBottom: '2px solid #8b4513',
        padding: '20px',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Logo alineado a la izquierda */}
        {restaurantInfo.logo && (
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}>
            <img 
              src={restaurantInfo.logo}
              alt="Logo"
              className="border border-2"
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                objectFit: 'cover',
                borderColor: '#8b4513',
                boxShadow: '0 4px 15px rgba(139, 69, 19, 0.3)'
              }} 
            />
          </div>
        )}

        {/* Contenedor del título centrado */}
        <div style={{
          maxWidth: 'calc(100% - 100px)',
          textAlign: 'center'
        }}>
          <h1 className="mb-1" style={{
            fontFamily: "'Courier New', monospace",
            fontWeight: 'bold',
            fontSize: '2rem',
            letterSpacing: '2px',
            color: '#4a3524'
          }}>
            {restaurantInfo.name.toUpperCase()}
          </h1>
          <p className="mb-0" style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '0.8rem',
            letterSpacing: '4px',
            color: '#8b4513'
          }}>
            ― MENÚ ―
          </p>
        </div>
      </div>

      {/* Body - Items centrados y compactos */}
      <div className="modal-body px-4 py-3" style={{ 
        overflowY: 'auto', // Permite scroll interno si es necesario
        maxHeight: 'calc(100vh - 200px)', // Ajusta según tu header/footer
        scrollbarWidth: 'none', // Para Firefox
        msOverflowStyle: 'none' // Para IE/Edge
      }}>
        {/* Esto oculta el scrollbar  */}
        <style>{`
          .modal-body::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {menuCategories.map((category) => (
          <div key={category.id} className="text-center mb-4">
            <h2 className="mb-3" style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '1.1rem',
              letterSpacing: '3px',
              color: '#8b4513',
              borderBottom: '1px dashed #8b4513',
              display: 'inline-block',
              padding: '0 10px'
            }}>
              {category.name.toUpperCase()}
            </h2>

            <div className="mx-auto" style={{ maxWidth: '500px' }}>
              {category.items.map((item) => (
                <div key={item.id} className="d-flex justify-content-between py-2 px-3"
                  style={{
                    borderBottom: '1px dotted #a05c38',
                    margin: '0 auto'
                  }}>
                  <span style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.9rem',
                    color: item.available ? '#4a3524' : '#a08b7a',
                    textAlign: 'left'
                  }}>
                    {item.name}
                    {!item.available && (
                      <span className="ms-2" style={{ color: '#d2691e', fontSize: '0.7rem' }}>
                        (AGOTADO)
                      </span>
                    )}
                  </span>
                  <span style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.9rem',
                    color: item.available ? '#8b4513' : '#a08b7a',
                    fontWeight: 'bold'
                  }}>
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
  );
};

export default CafeMenu;