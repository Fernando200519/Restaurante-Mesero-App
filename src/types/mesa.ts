export type MesaEstado =
  | "disponible"
  | "ocupada"
  | "esperando"
  | "agrupada"
  | "liberar";

export interface MeseroUI {
  nombre: string;
  online: boolean;
  avatarUrl?: string;
}

export interface Mesa {
  id: number;
  nombre: string;
  estado: string;
  zona: string;
  comensales: number;
  ordenId: number | null;
  meseroId: number | null;
  nombreMesero?: string;
  fotoPerfilMesero?: string;
  meseroDisponible?: boolean;
  fechaHoraInicioOcupacion?: string;
}

export interface MesaBackend {
  id: number;
  zona: string | null;
  estado: string;
  meseroId: number | null;
  nombreMesero: string | null;
  comensales: number | null;
  fotoPerfilMesero: string | null;
  meseroDisponible: boolean | null;
  ordenId: number | null;
  orderId?: number | null;
  fechaHoraInicioOcupacion: string | null;
}
