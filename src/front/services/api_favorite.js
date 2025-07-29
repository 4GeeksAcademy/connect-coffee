const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey =
  "2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9";

export const favoriteGet = async (token) => {
  try {
    const response = await fetch(backendUrl + "/api/favorite/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    const jsonResponse = await response.json();
    console.error("RESPNODE FAV", await jsonResponse);
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};

// {
// 	"store_id":5
// }
export const favoriteCreate = async (token, form) => {
  try {
    const response = await fetch(backendUrl + "/api/favorite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(form),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};

export const favoriteDelete = async (token, form) => {
  try {
    const response = await fetch(backendUrl + "/api/favorite", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(form),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};

export const favoriteStoreGet = async (token, store_id) => {
  try {
    const response = await fetch(
      backendUrl + "/api/favorite/store/" + store_id,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    const jsonResponse = await response.json();
    console.error("RESPNODE", await jsonResponse);
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};

// // Listado Publico con APIKEY
// export const getFrontStorePoints = async (entity_id) => {
//   try {
//     const response = await fetch(backendUrl + "/api/userpoint/list/front/store/"+entity_id, {
//       method: "GET",
//       headers: {
//           "Content-Type": "application/json",
//           "x-api-key":apikey,
//       }
//     });
//     const jsonResponse = await response.json();
//     console.error("USERPOINTS RESPNODE ",await jsonResponse);
//     return jsonResponse;

//   } catch (err) {
//       console.error("Fetch failed:", err);
//       throw err;
//   }
// };
