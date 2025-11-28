// src/context/AuthContext.tsx
import React, { createContext, useState, useContext } from "react";
import { Usuario } from "../types/auth";
import { authApi } from "../api/authApi";

interface AuthContextType {
  user: Usuario | null;
  signIn: (
    correo: string,
    contrasena: string
  ) => Promise<{ success: boolean; requirePasswordChange?: boolean }>;
  changePassword: (nuevaContrasena: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const signIn = async (correo: string, contrasena: string) => {
    try {
      // 1. Hacemos Login para obtener Token y Estado
      const loginData = await authApi.login(correo, contrasena);
      setToken(loginData.token);

      // 2. TRUCO: Buscamos al usuario usando el token recién obtenido
      // Traemos todos los usuarios y filtramos por el correo que ingresó
      const allUsers = await authApi.getUsers(loginData.token);
      const currentUser = allUsers.find((u) => u.correo === correo);

      if (!currentUser) {
        console.error("Usuario logueado no encontrado en la base de datos");
        return { success: false };
      }

      // 3. Guardamos al usuario COMPLETO (con ID, Nombre, etc.)
      setUser(currentUser);

      // 4. Verificamos si necesita cambio de contraseña
      // Usamos el estado que vino del login O el del usuario encontrado
      const estadoUsuario = loginData.estado || currentUser.estado;
      const esPrimerLogin = estadoUsuario === "Inactivo";

      return { success: true, requirePasswordChange: esPrimerLogin };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  };

  const changePassword = async (nuevaContrasena: string) => {
    // Necesitamos el ID que obtuvimos en el paso 2 del signIn
    if (!user || !user.id) throw new Error("No hay ID de usuario");

    try {
      await authApi.updatePassword(user.id, nuevaContrasena);
      // Al cambiarla, asumimos que ya es Activo
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
    <AuthContext.Provider value={{ user, signIn, changePassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Esto exporta el hook directamente desde aquí
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
