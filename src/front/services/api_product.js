const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey = "2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9";


export const productCreate = async (token,form) => {
  try {
    const response = await fetch(backendUrl + "/api/store/create", {
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