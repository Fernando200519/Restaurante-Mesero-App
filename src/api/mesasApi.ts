// src/api/mesasApi.ts
import { Mesa, MesaBackend } from "../types/mesa";

const API_URL = "http://137.184.191.81";

const adaptarMesa = (backendMesa: MesaBackend): Mesa => {
  let estadoUI: Mesa["estado"] = "disponible";
  const estadoBack = backendMesa.estado?.toUpperCase() || "LIBRE";

  if (estadoBack === "OCUPADA") estadoUI = "ocupada";
  else if (estadoBack === "ESPERANDO") estadoUI = "esperando";
  else if (estadoBack === "AGRUPADA") estadoUI = "agrupada";

  return {
    id: backendMesa.id.toString(),
    nombre: `Mesa ${backendMesa.id}`,
    capacidad: backendMesa.capacidad,
    ocupantes: backendMesa.comensales || 0,
    estado: estadoUI,
    zona: backendMesa.nombreZona || "General",
    alerta: false,
    mesero: backendMesa.fotoPerfilMesero
      ? {
          nombre: backendMesa.nombreMesero || "Mesero",
          online: backendMesa.esMeseroActivo || false,
          avatarUrl: backendMesa.fotoPerfilMesero,
        }
      : null,
    orderId: backendMesa.orderId,
    fechaInicio: backendMesa.ordenFechaHoraInicio,
  };
};

export const mesasApi = {
  getMesas: async (token: string): Promise<Mesa[]> => {
    try {
      const response = await fetch(`${API_URL}/tables`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, //
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada");
        throw new Error("Error al obtener mesas");
      }

      const mesasData: MesaBackend[] = await response.json();

      return mesasData.map(adaptarMesa);
    } catch (error) {
      console.error("Error en getMesas:", error);
      throw error;
    }
  },
  ocuparMesa: async (
    mesaId: number,
    empleadoId: number,
    comensales: number,
    token: string
  ): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          empleadoId: empleadoId,
          mesaId: mesaId,
          comensales: comensales,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("No se pudo ocupar la mesa: " + errorText);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en ocuparMesa:", error);
      throw error;
    }
  },
  agregarProductosOrden: async (
    orderId: number,
    items: any[],
    empleadoId: number,
    comensalNombre: string,
    token: string
  ): Promise<void> => {
    const payload = items.map((item) => ({
      productoId: item.producto.id,
      empleadoId: empleadoId,
      cantidad: item.cantidad,
      comensal: comensalNombre,
    }));

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Error enviando productos: " + errorText);
      }
    } catch (error) {
      console.error("Error en agregarProductosOrden:", error);
      throw error;
    }
  },
  getDetalleOrden: async (orderId: number, token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener detalles");

      const data = await response.json();

      if (data && Array.isArray(data.detallesOrden)) {
        return data.detallesOrden;
      }

      if (Array.isArray(data)) {
        return data;
      }

      return [];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  getZonasActivas: async (token: string): Promise<string[]> => {
    try {
      const response = await fetch(`${API_URL}/zones`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return [];

      const data = await response.json();

      return data
        .filter((z: any) => z.estado === "Activa")
        .map((z: any) => z.nombre);
    } catch (error) {
      console.error("Error cargando zonas:", error);
      return [];
    }
  },
};
