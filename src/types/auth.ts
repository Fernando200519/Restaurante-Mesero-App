// src/types/auth.ts

// Esta es la estructura de cómo guardaremos al usuario en la App
export interface Usuario {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correo: string;
  tipo: string; // "Mesero"
  estado: string; // "Activo" | "Inactivo"
  avatarUrl?: string;
}

export interface LoginResponse {
  token: string;
  estado: string;
  infoUsuario: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    tipo: string;
    fotoUrl?: string; // 👈 ¡AGREGA ESTA LÍNEA!
  };
}
