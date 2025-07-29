const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey =
  "2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9";

// Obtener perfil de usuario por ID (público)
export const getUserProfile = async (userId) => {
  try {
    const response = await fetch(`${backendUrl}/api/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apikey,
      },
    });
    const jsonResponse = await response.json();
    console.log("USER PROFILE RESPONSE:", jsonResponse);
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};

// Obtener favoritos de un usuario específico (público) - limitado a 20
export const getUserFavorites = async (userId) => {
  try {
    const response = await fetch(`${backendUrl}/api/user/${userId}/favorites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apikey,
      },
    });
    const jsonResponse = await response.json();
    console.log("USER FAVORITES RESPONSE:", jsonResponse);
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};

// Obtener reseñas de un usuario específico (público) - limitado a 20
export const getUserReviews = async (userId) => {
  try {
    const response = await fetch(`${backendUrl}/api/user/${userId}/reviews`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apikey,
      },
    });
    const jsonResponse = await response.json();
    console.log("USER REVIEWS RESPONSE:", jsonResponse);
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};
