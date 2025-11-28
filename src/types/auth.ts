// src/types/auth.ts

export interface Usuario {
  // Como el login no devuelve ID ni nombre, los marcaremos opcionales
  // o los sacaremos del token decodificado más adelante.
  id?: number;
  correo: string;
  rol: "Mesero" | "Admin" | string;
  estado: "Activo" | "Inactivo" | string;
  nombre?: string;
}

export interface LoginResponse {
  token: string;
  rol: string;
  estado: string;
  // OJO: Si puedes pedirle a tu backend que te devuelva también el "id": 123
  // aquí, sería MUCHO mejor. Si no, tendremos que decodificar el token.
}
