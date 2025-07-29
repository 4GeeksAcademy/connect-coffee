const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey = "2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9";

export const getCategories = async () => {
  try {
    const response = await fetch(backendUrl + "/api/category/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apikey
      },
    });
    const jsonResponse = await response.json();
    return jsonResponse.data;
  } catch (err) {
    const response = {
      data: [
        {
          description: "Presenta menu con alimentos de la categoria Sin TACC",
          id: 1,
          name: "Sin TACC",
          stores: [],
        },
        {
          description: "Presenta zona con wifi dentro de la cafeteria",
          id: 2,
          name: "WiFi",
          stores: [],
        },
        {
          description: "La cafeteria permite mascotas dentro del recinto",
          id: 3,
          name: "Pet Friendly",
          stores: [],
        },
        {
          description: "La cafeteria tiene zona de fumadores",
          id: 4,
          name: "Zona Fumadores lokos",
          stores: [],
        },
        {
          description:
            "La cafeteria tiene zonas de tranquilidad para personas con autismo",
          id: 5,
          name: "Espacios azules",
          stores: [],
        },
      ],
      msg: "Listado de Categorias",
      ok: true,
    };
    const jsonResponse = response;
    return jsonResponse.data ? jsonResponse.data : jsonResponse;
  }
};

export const categorySet = async (token, store_id, form) => {
  try {
    const response = await fetch(
      backendUrl + "/api/category/" + store_id + "/set",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(form),
      }
    );
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};

export const categoryUnset = async (token, store_id, form) => {
  try {
    const response = await fetch(
      backendUrl + "/api/category/" + store_id + "/unset",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(form),
      }
    );
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};
