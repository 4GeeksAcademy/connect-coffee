import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { getStoreMenu } from "../services/api_menu";
import QrCode from "./QrCode.jsx";

// Componente de vista previa del menú
const MenuPreview = ({ menu_id = null }) => {
  const { store, dispatch } = useGlobalReducer();
  const [menuPreview, setMenuPreview] = useState(false);
  const [storeMenu, setStoreMenu] = useState("");
  const [menuId, setMenuId] = useState(menu_id);
  const { id } = useParams(); //validar ID

  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "Café Central",
    logo: null,
    backgroundImage: null,
  });
  // Estado inicial del menú con categorías
  const [menuCategories, setMenuCategories] = useState([
    {
      id: 1,
      name: "BEBIDAS CALIENTES",
      items: [
        { id: 1, name: "Cappuccino", price: 3500, available: true },
        { id: 2, name: "Latte", price: 3200, available: true },
        { id: 3, name: "Espresso", price: 2500, available: true },
        { id: 4, name: "Americano", price: 2800, available: true },
      ],
    },
    {
      id: 2,
      name: "BEBIDAS FRÍAS",
      items: [
        { id: 5, name: "Frappé", price: 4000, available: true },
        { id: 6, name: "Iced Latte", price: 3500, available: true },
      ],
    },
    {
      id: 3,
      name: "REPOSTERÍA",
      items: [
        { id: 7, name: "Croissant", price: 2800, available: true },
        { id: 8, name: "Muffin", price: 2500, available: true },
      ],
    },
    {
      id: 4,
      name: "POSTRES",
      items: [
        { id: 9, name: "Cheesecake", price: 4200, available: false },
        { id: 10, name: "Tiramisú", price: 4500, available: true },
      ],
    },
  ]);
  const handleGetStoreMenu = async () => {
    setStoreMenu(await getStoreMenu(store.token));
  };
  useEffect(() => {
    handleGetStoreMenu(); // Ejemplo para obtener menu de la tienda de back
    setMenuId(menu_id ? menu_id : id);
    console.log("menuid", menuId);
  }, []);

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header border-0">
            <button
              className="btn-close btn-close-white"
              onClick={() => dispatch({ type: "menu_preview", payload: false })}
            ></button>
          </div>
          <div className="modal-body p-5">
            {/* Logo y título */}
            <div className="text-center mb-5">
              {restaurantInfo.logo && (
                <img
                  src={restaurantInfo.logo}
                  alt="Logo"
                  className="mb-3"
                  style={{
                    maxHeight: "60px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              )}
              <h1 className="display-4 mb-3">MENU</h1>
              <p className="text-muted">{restaurantInfo.name}</p>
            </div>

            {/* Menú en dos columnas */}
            <div className="row">
              {menuCategories.map((category, index) => (
                <div
                  key={category.id}
                  className={`col-md-6 mb-4 ${
                    index % 2 === 0 ? "pe-4" : "ps-4"
                  }`}
                >
                  <h4
                    className="mb-3 text-uppercase"
                    style={{ letterSpacing: "2px" }}
                  >
                    {category.name}
                  </h4>
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between mb-2"
                    >
                      <span
                        className={
                          item.available
                            ? ""
                            : "text-decoration-line-through text-muted"
                        }
                      >
                        {item.name}
                      </span>
                      <span className="text-muted">........ ${item.price}</span>
                    </div>
                  ))}
                  {category.items.length === 0 && (
                    <p className="text-muted fst-italic">Sin productos</p>
                  )}
                </div>
              ))}
            </div>

            {/* Pie de página */}
            <div className="text-center mt-5 pt-4 border-top border-secondary">
              <p className="mb-1">AVAILABLE ON YOUR FOOD</p>
              <p className="text-muted small">
                312-692-6732 | www.companyname.com
              </p>
              <QrCode id_menu={menuId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPreview;
