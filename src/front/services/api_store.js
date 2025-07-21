const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey="2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9"

export const getStoreIndex = async () => {
  const response = await fetch(backendUrl + "/api/store/list/index", {
    method: "GET",
    headers: { 
        "Content-Type": "application/json",
        "x-api-key":apikey
     },
  });
  if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  const jsonResponse = await response.json();
  return jsonResponse;
};

export const getStoreDetail = async (id) => {
  const response = await fetch(backendUrl + "/api/store/"+id+"/detail", {
    method: "GET",
    headers: { 
        "Content-Type": "application/json",
        "x-api-key":apikey
     },
  });
  if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  const jsonResponse = await response.json();
  return jsonResponse;
};
