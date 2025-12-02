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
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const signIn = async (correo: string, contrasena: string) => {
    try {
      // 1. Petición al Backend
      // authApi.login debe devolver Promise<LoginResponse>
      const response = await authApi.login(correo, contrasena);

      setToken(response.token);

      // 2. Mapeo de datos (Aquí arreglamos lo "raro")
      // Tu backend devuelve los datos personales dentro de 'infoUsuario',
      // pero el 'estado' viene afuera. Aquí unimos todo.
      const usuarioFormateado: Usuario = {
        id: response.infoUsuario.id,
        nombre: response.infoUsuario.nombre,
        apellidoPaterno: response.infoUsuario.apellidoPaterno,
        apellidoMaterno: response.infoUsuario.apellidoMaterno,
        tipo: response.infoUsuario.tipo,
        estado: response.estado, // Tomamos el estado de la raíz
        correo: correo, // Usamos el correo que escribió el usuario (porque infoUsuario no lo trae)
      };

      setUser(usuarioFormateado);

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
    if (!user || !user.id) throw new Error("No se encontró el ID del usuario");

    try {
      // Usamos el ID que ya guardamos en el estado 'user'
      await authApi.updatePassword(user.id, nuevaContrasena);

      // Actualizamos el estado localmente a "Activo" para que no pida cambio otra vez
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
      value={{ user, token, signIn, changePassword, signOut }}
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
