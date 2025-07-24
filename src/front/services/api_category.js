const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey =
  "2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9";

export const getCategories = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/category/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apikey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error("Error fetching categories:", error);
    // mock de un fallback //
    return {
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
          name: "Zona Fumadores",
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
      msg: "Listado de Categorias (Fallback)",
      ok: true,
    };
  }
};
