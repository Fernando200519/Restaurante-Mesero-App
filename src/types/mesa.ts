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
  zona: string;
  estado: string;
  // capacidad: number;
  comensales: number | null;
  fotoPerfilMesero?: string | null;
  meseroDisponible?: boolean;
  nombreMesero?: string | null;
  orderId?: number | null; // Por si acaso
  ordenId?: number | null; // El que viene en tu JSON real
  fechaHoraInicioOcupacion?: string | null;
}
