// src/types/mesa.ts

export type MesaEstado = "disponible" | "ocupada" | "esperando" | "agrupada";

export interface MeseroUI {
  nombre: string;
  online: boolean;
  avatarUrl?: string;
}

export interface Mesa {
  id: string;
  nombre: string;
  capacidad: number;
  ocupantes: number;
  estado: MesaEstado;
  zona?: string;
  alerta?: boolean;
  mesero?: MeseroUI | null;
  orderId?: number;
  fechaInicio?: string | null;
}

export interface MesaBackend {
  id: number;
  nombreZona: string;
  estado: string;
  capacidad: number;
  comensales: number;
  fotoPerfilMesero?: string;
  esMeseroActivo?: boolean;
  orderId?: number;
  fechaInicio?: string | null;
  ordenFechaHoraInicio?: string | null;
  nombreMesero?: string;
}
