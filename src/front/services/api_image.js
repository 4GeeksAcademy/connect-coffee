const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikey =
  "2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9";

export const setImageByType = async (token, imageUrl, type, owner_type, owner_id) => {
  // hace case para index
  try {
    if (!token) {
      return { msg: "Debe iniciar sesion para poder ver el menu", ok: False };
    }
    const request_body = {
      owner_type: owner_type,
      owner_id: owner_id,
      name: type,
      img_type: type,
      url: imageUrl,
      position: "1",
    };
    const response = await fetch(backendUrl + "/api/image/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(request_body),
    });
    if (!response.ok) {
      throw new Error(
        `Error Detectado ${response.status}: ${response.statusText}`
      );
    }
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error(error);
  }
};

export const setImage = async (token, imageUrl, entity, entity_id, type) => {
  // hace case para index
  try {
    if (!token) {
      return { msg: "Debe iniciar sesion para gestionar la tienda", ok: False };
    }
    const request_body = {
      owner_type: entity,
      owner_id: entity_id,
      name: type,
      img_type: type,
      url: imageUrl,
      position: "1",
    };
    const response = await fetch(backendUrl + "/api/image/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(request_body),
    });
    if (!response.ok) {
      throw new Error(
        `Error Detectado ${response.status}: ${response.statusText}`
      );
    }
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error(error);
  }
};

export const ImageDelete = async (token, image_id) => {
  // hace case para index
  try {
    if (!token) {
      return { msg: "Debe iniciar sesion para gestionar la tienda", ok: False };
    }
    const response = await fetch(backendUrl + "/api/image/" + image_id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (!response.ok) {
      throw new Error(
        `Error Detectado ${response.status}: ${response.statusText}`
      );
    }
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error(error);
  }
};
