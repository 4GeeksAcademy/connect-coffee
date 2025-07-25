const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey="2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9"


export const getStorePoints = async (token) => {
  try {
    const response = await fetch(backendUrl + "/api/userpoint/list/store", {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
       }
    });
    const jsonResponse = await response.json();
    console.error("RESPNODE",await jsonResponse);
    return jsonResponse;

  } catch (err) {
      console.error("Fetch failed:", err);
      throw err;
  }
};
// Listado Publico con APIKEY
export const getFrontStorePoints = async (entity_id) => {
  try {
    const response = await fetch(backendUrl + "/api/userpoint/list/front/store/"+entity_id, {
      method: "GET",
      headers: { 
          "Content-Type": "application/json",
          "x-api-key":apikey,
      }
    });
    const jsonResponse = await response.json();
    console.error("USERPOINTS RESPNODE ",await jsonResponse);
    return jsonResponse;

  } catch (err) {
      console.error("Fetch failed:", err);
      throw err;
  }
};
export const userPointCreate = async (token,form) => {
  try {                                         
    const response = await fetch(backendUrl + "/api/userpoint/create", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
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