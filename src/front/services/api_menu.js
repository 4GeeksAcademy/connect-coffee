const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey="2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9"

export const getStoreMenu = async (token) => {
  if (! token){
     return {"msg":"Debe iniciar sesion para poder ver el menu","ok":False};
   }
  const response = await fetch(backendUrl + "/api/menu/list", {
    method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
  });
  if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  const jsonResponse = await response.json();
  return jsonResponse;
};

export const menuCreate = async (token,form) => {
  try {
    const response = await fetch(backendUrl + "/api/menu/create", {
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


export const getFrontStoreMenu = async (store_id) => {
try{
    const response = await fetch(backendUrl + "/api/menu/front/list/"+store_id, {
      method: "GET",
      headers: { 
          "Content-Type": "application/json",
          "x-api-key":apikey,
      }
    });
    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (err) {
      console.error("Fetch failed:", err);
      throw err;
  }
};
