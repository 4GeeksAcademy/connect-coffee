const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey="2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9"

export const getStoreMenu = async (token) => {
  console.log("TOKEN=",token);
  // Token harcodeado meter el token de la tienda que tenga menu en las prueba 
  //token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MzE0MzAzNSwianRpIjoiNDFhYTVhN2YtZTJlMC00MmUxLWFjODAtMWU2MzI4MmQxM2FiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjIyIiwibmJmIjoxNzUzMTQzMDM1LCJjc3JmIjoiM2ViZGU0NDEtYTE2Ny00MDgyLTljYjctNTE4ODQ1NzdiMDhiIiwiZXhwIjoxNzUzMTQzOTM1fQ.Wr77uv1PP8UF9kQhKl335Jazle0jSAJ22KqXf2H1Hro";
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
