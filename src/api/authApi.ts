import { Usuario, LoginResponse } from "../types/auth";

const BASE_URL = "http://137.184.191.81";

export const authApi = {
  login: async (correo: string, contraseña: string): Promise<LoginResponse> => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Type": "react-native-app",
      },
      body: JSON.stringify({ correo, contraseña }),
    });

    if (!response.ok) throw new Error("Error en credenciales");
    const data = await response.json();

    console.log("Respuesta Login:", data);
    return data;
  },
  updatePassword: async (
    contraseñaActual: string,
    contraseñaNueva: string,
    confirmacionContraseñaNueva: string,
    token: string
  ): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/users/me/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contraseñaActual,
          contraseñaNueva,
          confirmacionContraseñaNueva,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al actualizar la contraseña");
      }
    } catch (error) {
      console.error("Error updatePassword:", error);
      throw error;
    }
  },

  getMe: async (token: string): Promise<any> => {
    const response = await fetch(`${BASE_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("No se pudo obtener el perfil");
    return await response.json();
  },

  updateUserProfile: async (
    token: string,
    data: {
      fotoUri?: string;
      telefono?: string;
      estado?: string;
    }
  ): Promise<void> => {
    const formData = new FormData();

    if (data.telefono !== undefined) {
      formData.append("Telefono", data.telefono);
    }
    if (data.estado !== undefined) {
      formData.append("Estado", data.estado);
    }
    if (data.fotoUri) {
      const filename = data.fotoUri.split("/").pop() || "foto.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const fileData = {
        uri: data.fotoUri,
        name: filename,
        type: type,
      } as any;

      formData.append("FotoPerfil", fileData);
      formData.append("UpdateProfilePhoto", "true");
    }
    const response = await fetch(`${BASE_URL}/users/me`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el perfil");
    }
  },
  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          clientUri: "http://137.184.191.81/reset-password.html",
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo enviar el correo de recuperación");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  refreshToken: async (
    tokenExpirado: string
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
      const response = await fetch(`${BASE_URL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Type": "react-native-app",
        },
        body: JSON.stringify({ refreshToken: tokenExpirado }),
      });

      if (!response.ok) throw new Error("Sesión expirada");

      const data = await response.json();
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      throw error;
    }
  },
};
