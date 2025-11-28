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
}

// Esta es la estructura EXACTA de la respuesta de tu backend al hacer Login
// (Basado en tu captura donde aparece "infoUsuario")
export interface LoginResponse {
  token: string;
  estado: string; // Viene en la raíz
  infoUsuario: {
    // Objeto anidado
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    tipo: string;
  };
}
