const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey =
  "2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9";

export const getAdminStoresList = async (token) => {
  try {
    if (!token) {
      return { msg: "Debe iniciar sesión como administrador", ok: false };
    }

    const response = await fetch(backendUrl + "/api/store/admin/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        "x-api-key": apikey,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error("Error en getAdminStoresList:", error);
    return { msg: "Error de conexión", ok: false, error: error.message };
  }
};

export const getAdminStoreDetail = async (token, storeId) => {
  try {
    if (!token) {
      return { msg: "Debe iniciar sesión como administrador", ok: false };
    }

    const response = await fetch(backendUrl + `/api/store/admin/${storeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        "x-api-key": apikey,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error("Error en getAdminStoreDetail:", error);
    return { msg: "Error de conexión", ok: false, error: error.message };
  }
};

// Actualizar estado de una tienda (activar/suspender) ** is active //
export const updateStoreStatus = async (token, storeId, status) => {
  try {
    if (!token) {
      return { msg: "Debe iniciar sesión como administrador", ok: false };
    }

    const response = await fetch(
      backendUrl + `/api/store/admin/${storeId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
          "x-api-key": apikey,
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error("Error en updateStoreStatus:", error);
    return { msg: "Error de conexión", ok: false, error: error.message };
  }
};

// Eliminar una tienda //
export const deleteStore = async (token, storeId) => {
  try {
    if (!token) {
      return { msg: "Debe iniciar sesión como administrador", ok: false };
    }

    const response = await fetch(
      backendUrl + `/api/store/admin/${storeId}/deactivate`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
          "x-api-key": apikey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error("Error en deleteStore:", error);
    return { msg: "Error de conexión", ok: false, error: error.message };
  }
};

// Obtener estadísticas del dashboard de administración
export const getAdminStats = async (token) => {
  try {
    if (!token) {
      return { msg: "Debe iniciar sesión como administrador", ok: false };
    }

    const response = await fetch(backendUrl + "/api/store/" + id + "/detail", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        "x-api-key": apikey,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error("Error en getAdminStats:", error);
    return { msg: "Error de conexión", ok: false, error: error.message };
  }
};
