// ==========================================
// 1. LO QUE TU UI NECESITA (Tu estructura actual)
// ==========================================
export type MesaEstado = "disponible" | "ocupada" | "esperando" | "agrupada";

export interface Mesero {
  id: string;
  nombre: string;
  online: boolean;
  avatarUrl?: string;
}

export interface Mesa {
  id: string; // Tu UI usa string
  nombre: string;
  capacidad: number;
  ocupantes: number;
  estado: MesaEstado;
  zona?: string; // Tu UI espera el nombre "Terraza"
  alerta?: boolean;
  mesero?: Mesero | null;
}

// ==========================================
// 2. LO QUE LLEGA DEL BACKEND (La realidad)
// ==========================================
export interface MesaBackend {
  id: number;
  estado: string; // "Libre", "Ocupada"
  capacidad: number;
  zonaId: number; // El backend da ID
  fechaHoraInicio?: string | null;
  totalCuentaActiva?: number | null;
}

export interface ZonaBackend {
  id: number;
  nombre: string;
  estado: string;
}

export interface FormDataResponse {
  zonas: ZonaBackend[];
}
