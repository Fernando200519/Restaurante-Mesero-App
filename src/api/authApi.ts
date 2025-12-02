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
    nuevaContrasena: string,
    token: string // 👈 1. AGREGAR ESTE PARÁMETRO
  ): Promise<void> => {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 👈 2. AGREGAR EL HEADER DE SEGURIDAD
      },
      body: JSON.stringify({ contraseña: nuevaContrasena }),
    });

    if (!response.ok) {
      // Tip: Agrega esto para ver qué dice el servidor si falla
      const errorText = await response.text();
      console.log("Error Password:", errorText);
      throw new Error("Error al actualizar contraseña");
    }
  },

  updateProfilePicture: async (
    userId: number,
    imageUri: string,
    token: string
  ): Promise<void> => {
    const formData = new FormData();

    // 1. Preparar el archivo
    const filename = imageUri.split("/").pop() || "foto.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // React Native requiere este objeto específico para archivos
    const fileData = {
      uri: imageUri,
      name: filename,
      type: type,
    } as any; // 'as any' para evitar quejas de TS con FormData

    // 2. Agregar los campos EXACTOS del Swagger
    formData.append("FotoPerfil", fileData);

    // TRUCO IMPORTANTE: Envíalo como string "true", el backend lo interpretará
    formData.append("UpdateProfilePhoto", "true");

    // 3. Petición
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // Tu token del Login
        // ⛔ NO PONGAS 'Content-Type': 'multipart/form-data'
        // Deja que fetch lo ponga solo, si lo pones tú, rompes la subida.
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server Error:", errorText);
      throw new Error(`Error ${response.status}: No se pudo subir la foto`);
    }
  },
};
