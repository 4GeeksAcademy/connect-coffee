const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey =
  "2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9";

const menuCreate = async (token, form) => {
  try {
    const response = await fetch(backendUrl + "/api/menu/create", {
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

const productCreate = async (token, form) => {
  try {
    const response = await fetch(backendUrl + "/api/product/create", {
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

const getProducts = async (token) => {
  try {
    const response = await fetch(backendUrl + "/api/product/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};

const updateProduct = async (token, id, form) => {
  try {
    const response = await fetch(
      backendUrl + "/api/product/" + id + "/update",
      {
        method: "PUT",
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

const deleteProduct = async (token, id) => {
  try {
    const response = await fetch(backendUrl + "/api/product/" + id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};

const deactivateProduct = async (token, id) => {
  try {
    const response = await fetch(
      backendUrl + "/api/product/" + id + "/deactivate",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};

const activateProduct = async (token, id) => {
  try {
    const response = await fetch(
      backendUrl + "/api/product/" + id + "/activate",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
};

export {
  menuCreate,
  productCreate,
  getProducts,
  updateProduct,
  deleteProduct,
  deactivateProduct,
  activateProduct
};