import React, { createContext, useState, useContext } from "react";
import { Usuario } from "../types/auth";
import { authApi } from "../api/authApi";

interface AuthContextType {
  user: Usuario | null;
  token: string | null; // 👈 1. AGREGAMOS ESTO
  // La función signIn devuelve si fue éxito y si requiere cambio de pass
  signIn: (
    correo: string,
    contrasena: string
  ) => Promise<{ success: boolean; requirePasswordChange?: boolean }>;
  changePassword: (nuevaContrasena: string) => Promise<void>;
  signOut: () => void;
  // 👇 AGREGAR ESTA NUEVA FUNCIÓN A LA INTERFAZ
  updateUserPhoto: (newUrl: string) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 👇 AGREGAR ESTA FUNCIÓN
  const updateUserPhoto = (newUrl: string) => {
    if (user) {
      // Creamos una copia del usuario con la nueva foto
      setUser({ ...user, avatarUrl: newUrl }); // Asegúrate que tu tipo Usuario tenga 'avatarUrl' (o 'fotoUrl' según como lo hayas llamado)
    }
  };

  const signIn = async (correo: string, contrasena: string) => {
    try {
      // 1. Petición al Backend
      // authApi.login debe devolver Promise<LoginResponse>
      const response = await authApi.login(correo, contrasena);

      setToken(response.token);

      // 2. Mapeo de datos
      const usuarioLogueado: Usuario = {
        id: response.infoUsuario.id,
        nombre: response.infoUsuario.nombre,
        apellidoPaterno: response.infoUsuario.apellidoPaterno,
        apellidoMaterno: response.infoUsuario.apellidoMaterno,
        tipo: response.infoUsuario.tipo,
        estado: response.estado,
        correo: correo, // El del input

        // 👇 ¡ESTO ES LO QUE FALTABA!
        // Mapeamos 'fotoUrl' (del JSON) a 'avatarUrl' (de tu App)
        avatarUrl: response.infoUsuario.fotoUrl,
      };

      setUser(usuarioLogueado);

      // 3. Lógica de Redirección
      // Si el backend dice explícitamente "Inactivo", activamos la bandera
      const esInactivo = response.estado === "Inactivo";

      return { success: true, requirePasswordChange: esInactivo };
    } catch (error) {
      // CÁMBIALO POR ESTO:
      console.log("Intento de login fallido"); // Solo para ti en la consola
      return { success: false };
    }
  };

  const changePassword = async (nuevaContrasena: string) => {
    // Validamos que tengamos todo lo necesario
    if (!user || !user.id) throw new Error("No hay ID de usuario");
    if (!token) throw new Error("No hay token de sesión"); // 👈 Validación extra

    try {
      // 👇 PASAMOS EL TOKEN AQUÍ
      await authApi.updatePassword(user.id, nuevaContrasena, token);

      // Actualizamos estado local
      setUser({ ...user, estado: "Activo" });
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
  };

  return (
    // 👇 2. AGREGAMOS 'token' AL VALUE DEL PROVIDER
    <AuthContext.Provider
      value={{ user, token, signIn, changePassword, signOut, updateUserPhoto }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
