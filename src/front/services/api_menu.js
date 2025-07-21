const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey="2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9"

export const getStoreMenu = async (token) => {
  console.log("TOKEN=",token);
  // Token harcodeado meter el token de la tienda que tenga menu en las prueba 
  token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MzEyMTYxNiwianRpIjoiZTdmODFhMWUtZmEwYy00NjM3LThlZjEtYjQ3MTc2ODE2N2VhIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjIyIiwibmJmIjoxNzUzMTIxNjE2LCJjc3JmIjoiZmI5MmVkMWYtMTUwZS00MzkzLTgxZDktNDIzMmZlNDAxZDY0IiwiZXhwIjoxNzUzMTIyNTE2fQ.aLaRcj4G0faa5vBWnVh-Jj2z4yy99R0sIF8MuAvLy8Q";
  // if (! token){
  //   return {"msg":"Debe iniciar sesion para poder ver el menu","ok":False};
  // }
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
