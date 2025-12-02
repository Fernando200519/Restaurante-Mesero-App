// src/api/authApi.ts
import { Usuario, LoginResponse } from "../types/auth";

const BASE_URL = "http://137.184.191.81";

export const authApi = {
  // Nota la 'ñ' en el argumento, tal como lo pide tu back
  login: async (correo: string, contraseña: string): Promise<LoginResponse> => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contraseña }),
    });

    if (!response.ok) throw new Error("Error en credenciales");
    return await response.json();
  },

  updatePassword: async (
    userId: number,
    nuevaContrasena: string
  ): Promise<void> => {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contraseña: nuevaContrasena }), // ñ obligatoria
    });

    if (!response.ok) throw new Error("Error al actualizar contraseña");
  },

  updateProfilePicture: async (
    userId: number,
    imageUri: string,
    token: string
  ): Promise<void> => {
    // 1. Preparamos el FormData
    const formData = new FormData();

    // Obtenemos el tipo de archivo (jpg/png) basado en la extensión o ponemos jpeg por defecto
    const filename = imageUri.split("/").pop() || "profile.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    const fileData = {
      uri: imageUri,
      name: filename,
      type: type,
    };

    // 2. Agregamos los campos EXACTOS del Swagger
    formData.append("FotoPerfil", fileData as any);
    formData.append("UpdateProfilePhoto", "true");

    console.log("Enviando foto a:", `${BASE_URL}/users/${userId}`);
    // console.log("Token usado:", token); // Descomenta si quieres verificar el token

    // 3. Petición
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        // ¡IMPORTANTE! NO AGREGUES 'Content-Type': 'multipart/form-data' AQUÍ
        // React Native lo agrega solo con el 'boundary' correcto. Si lo pones tú, falla.
      },
      body: formData,
    });

    // 4. Diagnóstico de errores
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Status Code:", response.status); // 👈 ESTO NOS DIRÁ QUÉ PASA
      console.error("Respuesta del servidor:", errorText);

      if (response.status === 413) throw new Error("La imagen es muy pesada");
      if (response.status === 401) throw new Error("Token vencido o inválido");

      throw new Error(`Error ${response.status}: No se pudo subir la imagen`);
    }
  },
};
