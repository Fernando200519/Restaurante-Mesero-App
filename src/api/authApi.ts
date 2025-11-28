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
};
