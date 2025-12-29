import React, { createContext, useState, useContext, useEffect } from "react";
import { Usuario } from "../types/auth";
import { authApi } from "../api/authApi";
import { storage } from "../utils/storage";

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  refreshToken: string | null;
  signIn: (
    correo: string,
    contrasena: string
  ) => Promise<{ success: boolean; requirePasswordChange?: boolean }>;
  changePassword: (
    actual: string,
    nueva: string,
    confirmacion: string
  ) => Promise<void>;
  signOut: () => void;
  updateUserPhoto: (newUrl: string) => void;
  updateUserFields: (fields: Partial<Usuario>) => void;
  refreshSession: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const updateUserFields = (fields: Partial<Usuario>) => {
    if (user) setUser({ ...user, ...fields });
  };

  const updateUserPhoto = (newUrl: string) => {
    updateUserFields({ avatarUrl: newUrl });
  };

  const signIn = async (correo: string, contrasena: string) => {
    try {
      const loginData = await authApi.login(correo, contrasena);

      await storage.saveTokens(loginData.accessToken, loginData.refreshToken);

      setToken(loginData.accessToken);
      setRefreshToken(loginData.refreshToken);

      let datosUsuario = loginData.infoUsuario;

      if (datosUsuario.estado !== "Inactivo") {
        try {
          const perfilEnriquecido = await authApi.getMe(loginData.accessToken);
          datosUsuario = { ...datosUsuario, ...perfilEnriquecido };
        } catch (perfilError) {
          console.log("No se pudo enriquecer el perfil");
        }
      }

      const usuarioLogueado: Usuario = {
        id: datosUsuario.id,
        nombre: datosUsuario.nombre,
        apellidoPaterno: datosUsuario.apellidoPaterno,
        apellidoMaterno: datosUsuario.apellidoMaterno,
        tipo: datosUsuario.tipo,
        estado: datosUsuario.estado,
        correo: correo,
        avatarUrl: datosUsuario.fotoUrl,
        telefono: datosUsuario.telefono,
      };

      setUser(usuarioLogueado);

      return {
        success: true,
        requirePasswordChange: usuarioLogueado.estado === "Inactivo",
      };
    } catch (error) {
      console.error("Error en signIn:", error);
      return { success: false };
    }
  };

  const changePassword = async (
    actual: string,
    nueva: string,
    confirmacion: string
  ) => {
    if (!user || !token) throw new Error("No hay sesión activa");
    try {
      await authApi.updatePassword(actual, nueva, confirmacion, token);
      updateUserFields({ estado: "Activo" });
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await storage.removeTokens();
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  };

  const refreshSession = async (): Promise<string | null> => {
    // Cambia boolean por string | null
    if (!refreshToken) return null;

    try {
      console.log("🔄 Rotando tokens...");
      const { accessToken: newAccess, refreshToken: newRefresh } =
        await authApi.refreshToken(refreshToken);

      await storage.saveTokens(newAccess, newRefresh);

      setToken(newAccess);
      setRefreshToken(newRefresh);

      console.log("✅ ¡Sesión renovada con éxito! Nuevo token listo.");
      return newAccess; // Devuelve el nuevo token
    } catch (error) {
      console.log("❌ Error en rotación. Cerrando sesión...");
      await signOut();
      return null;
    }
  };
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAccess = await storage.getAccessToken();
        const storedRefresh = await storage.getRefreshToken();

        if (storedAccess && storedRefresh) {
          setToken(storedAccess);
          setRefreshToken(storedRefresh);

          try {
            const userData = await authApi.getMe(storedAccess);
            setUser({
              id: userData.id,
              nombre: userData.nombre,
              apellidoPaterno: userData.apellidoPaterno,
              apellidoMaterno: userData.apellidoMaterno,
              tipo: userData.tipo,
              estado: userData.estado,
              correo: userData.email || "",
              avatarUrl: userData.fotoUrl,
            });
          } catch (e) {
            const success = await refreshSession();
            if (!success) await signOut();
          }
        }
      } catch (error) {
        console.error("Error al inicializar sesión:", error);
      } finally {
        // Aquí podrías desactivar un Splash Screen si lo tuvieras
      }
    };

    initializeAuth();
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        signIn,
        changePassword,
        signOut,
        updateUserPhoto,
        refreshSession,
        updateUserFields,
      }}
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
