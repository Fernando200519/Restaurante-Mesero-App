// src/api/authApi.ts
import { Usuario, LoginResponse } from "../types/auth";

const BASE_URL = "http://137.184.191.81";

export const authApi = {
  login: async (correo: string, contraseña: string): Promise<LoginResponse> => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contraseña }),
    });

    if (!response.ok) throw new Error("Error en credenciales");
    return await response.json();
  },

  // Nueva función para obtener todos los usuarios
  getUsers: async (token: string): Promise<Usuario[]> => {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Es probable que tu API pida el token aquí. Si no lo pide, quita esta línea.
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al obtener usuarios");
    return await response.json();
  },

  updatePassword: async (
    userId: number,
    nuevaContrasena: string
  ): Promise<void> => {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contraseña: nuevaContrasena }),
    });

    if (!response.ok) throw new Error("Error al actualizar contraseña");
  },
};
