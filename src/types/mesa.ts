// src/types/mesa.ts

export type MesaEstado = "disponible" | "ocupada" | "esperando" | "agrupada";

// Definimos bien qué datos necesita el Mesero en la UI
export interface MeseroUI {
  nombre: string;
  online: boolean;
  avatarUrl?: string; // 👈 La UI busca esto, no "imagen"
}

export interface Mesa {
  id: string;
  nombre: string;
  capacidad: number;
  ocupantes: number;
  estado: MesaEstado;
  zona?: string;

  // 👇 AGREGAMOS ESTAS DOS QUE FALTABAN PARA CORREGIR LOS ERRORES
  alerta?: boolean;
  mesero?: MeseroUI | null;
  // 👇 ¡TE FALTABA ESTA LÍNEA AQUÍ!
  orderId?: number;
}

// Interface del Backend (se queda igual, basada en tu captura)
export interface MesaBackend {
  id: number;
  nombreZona: string;
  estado: string;
  capacidad: number;
  comensales: number;
  fotoPerfilMesero?: string;
  esMeseroActivo?: boolean;
  // 👇 AGREGAR ESTA LÍNEA:
  orderId?: number;
}
