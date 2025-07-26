import React, { useState, useEffect } from "react";
import { storeCreate, getUserStore } from '../services/api_store';
import { menuCreate } from '../services/api_menu';
import { categorySet, getCategories } from '../services/api_category.js';
import Cloudinary from './Cloudinary.jsx';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from 'react-router-dom';

const StoreBuilderForm = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [hasStore, setHasStore] = useState(null);
  const [menuResponse, setMenuResponse] = useState(null);
  const [storeResponse, setStoreResponse] = useState(null);
  const [categoryResponse, setCategoryResponse] = useState(null);
  const [categories, setCategories] = useState(null);

  const [form, setForm] = useState({
    empresa: '',
    direccion: '',
    logoPrincipal: null,
    ImagenDetalle: null,
    tituloMenu: '',
    categorias: [],
    productoEjemplo: {
      store_id: null,
      name: '',
      description: '',
      price: '',
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm({ ...form, [name]: name === 'ImagenDetalle' ? [...files] : files[0] });
  };

  const next = async () => {
    console.log(step);
    if (step == 2) {
      setMenuResponse(await menuCreate(store.token, { 'store_id': await storeResponse.id, 'description': form.tituloMenu }));
      //console.log(await menuResponse)
    }
    if (step == 3) {
      setCategoryResponse(await categorySet(store.token, await storeResponse.id, { 'category_ids': form.categorias, 'description': form.tituloMenu }));
    }
    setStep((prev) => prev + 1);
  };
  const back = () => setStep((prev) => prev - 1);

  const handleCategoriaToggle = (id) => {
    const categorias = form.categorias.includes(id)
      ? form.categorias.filter((c) => c !== id)
      : [...form.categorias, id];
    setForm({ ...form, categorias });
  };
  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      productoEjemplo: {
        ...form.productoEjemplo,
        [name]: value,
      },
    });
  };

  const handleSubmit = async () => {
    console.log("Formulario enviado:", form);
    navigate('/provider/' + storeResponse.id)
    console.log(categoryResponse)
  }

  const handleGetCategories = async () => {
    const responseApi = await getCategories(store.token);
    setCategories(responseApi);
  }
  const handleGetStore = async () => {
    const responseApi = await getUserStore(store.token);
    if (await responseApi?.data[0]) {
      setStoreResponse(await responseApi?.data[0]);

      if (await responseApi?.data[0].is_active) {
        //setHasStore(true);
        navigate('/provider/' + storeResponse.id)
      } else {
        navigate('/payment')
      }
    }
    return false;
  }

  const handleGetStore2 = async () => {
    try {
      const responseApi = await getUserStore(store.token);
      if (responseApi?.data?.length > 0) {
        const storeresponsetest = responseApi.data[0];
        setStoreResponse(storeresponsetest)

        if (storeresponsetest.is_active) {
          //setHasStore(true);
          navigate('/provider/' + storeresponsetest?.id);
        } else {
          navigate('/payment')
        }
        return true;
      } else {
        console.log('Test datos de tienda');
        return false;
      }
    } catch (error) {
      console.error('Test no recibe datos', error);
      return false;
    }
  }

  useEffect(() => {
    // Verificar si el usuario ya está autenticado

    handleGetCategories();
    handleGetStore();

    if (hasStore != null && hasStore == true) {
      navigate('/provider/' + storeResponse.id)
    };

  }, []);



  return (
    <>
      {storeResponse?.id && (
        <div className="p-4 max-w-md mx-auto shadow rounded bg-white">

          {step === 1 && (
            <>
              <h2 className="text-xl font-bold mb-4">Paso {step}</h2>
              <label className="block mb-4">
                <p>Nombre de la empresa:{storeResponse.name}</p>
                <p>Direccion: {storeResponse.address}</p>
                {storeResponse.id && (<Cloudinary preset="width400" image_type="store" owner_id={storeResponse.id} label="Imágen de detalle:" />)}
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <label className="block mb-4">
                Título del menú:
                <input type="text" name="tituloMenu" value={form.tituloMenu} onChange={handleChange} className="w-full border rounded p-2" />
              </label>
              <label className="block mb-2">
                <Cloudinary preset="width100" image_type="menu" owner_id={storeResponse.id} label="Logo principal:" />
              </label>
            </>
          )}

          {step === 3 && (
            <div className="mb-4">
              <p className="font-medium mb-2">Seleccioná una o más categorías:</p>
              {categories?.map((cat) => (
                <label key={cat.id} className="block mb-1">
                  <input
                    type="checkbox"
                    value={cat.id}
                    checked={form.categorias.includes(cat.id)}
                    onChange={() => handleCategoriaToggle(cat.id)}
                    className="m-2"
                  />
                  {cat.name}
                </label>
              )) || <p className="text-gray-500">Cargando categorías...</p>}
            </div>
          )}

          {step === 4 && (
            <div className="mb-4 space-y-3">
              <label className="block">
                Nombre del producto:
                <input
                  type="text"
                  name="name"
                  value={form.productoEjemplo.name}
                  onChange={handleProductoChange}
                  className="w-full border rounded p-2"
                />
              </label>

              <label className="block">
                Descripción:
                <textarea
                  name="description"
                  value={form.productoEjemplo.description}
                  onChange={handleProductoChange}
                  className="w-full border rounded p-2"
                />
              </label>

              <label className="block">
                Precio:
                <input
                  type="number"
                  name="price"
                  value={form.productoEjemplo.price}
                  onChange={handleProductoChange}
                  className="w-full border rounded p-2"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
          )}
          {storeResponse?.is_active && (
            <div className="flex justify-between mt-4">
              {step > 1 && <button onClick={back} className="px-4 py-2 bg-gray-300 rounded">Atrás</button>}
              {step < 4 && <button onClick={next} className="px-4 py-2 bg-blue-500 text-white rounded">Siguiente</button>}
              {step === 4 && <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded">Enviar</button>}
            </div>
          )}
        </div>
      )
      }
    </>
  );
};


export default StoreBuilderForm;

//logoPrincipal: null,



// 1) 
// - nombre empresa
// - direccion
// 2)
// - Imagen una para el listado de tiendas 
// - 2 o 3 para el detalle de tienda
// 3) 
// - Titulo del menu (puede ser el nombre del lugar)
// 4) 
// - una categoria
// 5) 
// - un producto para el menu (de ejemplo) 
// Aquí podrías enviar a una API o algo similar
// StoreCreate
//	"nombre":"Store Coffee",
// "direccion":"Store Address 2"
// "url": "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400",
// Listado Princial (1)
// "name": "Descripcion para imagen",
// "url": "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400",
// Detalle de tienda (1-n)
// "name": "Descripcion para imagen",
// "url": "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400",
// Menu 
//(store_id)
// Titulo de menu
// Logo (1)
// (menu_id)
// "name": "Descripcion para imagen"
// id categoria prestaciones del establecimiento (1-6) ("wifi", "sin-tacc", "pet-friendly","Zona Fumadores", "Espacios Azules")
// (menu_id),
// "name":"Nombre Producto | Cafe cortado",
// "description":"Una texto promocional descipriptivo del producto | Calentito con una galletita y soda",
// "price":"Precio en USD" | 10 
