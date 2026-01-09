export interface Usuario {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  tipo: string;
  estado: string;
  correo: string;
  avatarUrl?: string;
  telefono?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  infoUsuario: {
    nombre: string;
    apellidoPaterno: string;
    tipo: string;
    fotoUrl?: string;
    estado: string;
    notificaciones?: any;
  };
}
