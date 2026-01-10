import { Mesa, MesaBackend } from "../types/mesa";

const API_URL = "http://137.184.191.81";

const adaptarMesa = (backendMesa: MesaBackend): Mesa => {
  let estadoUI: Mesa["estado"] = "disponible";

  const estadoBack = backendMesa.estado?.toUpperCase() || "LIBRE";

  if (estadoBack === "OCUPADA") {
    estadoUI = "ocupada";
  } else if (estadoBack === "ESPERANDO" || estadoBack === "PENDIENTE DE PAGO") {
    estadoUI = "esperando";
  } else if (estadoBack === "AGRUPADA") {
    estadoUI = "agrupada";
  } else if (estadoBack === "POR LIBERAR") {
    estadoUI = "liberar";
  }

  return {
    id: backendMesa.id,
    nombre: `Mesa ${backendMesa.id}`,
    comensales: backendMesa.comensales || 0,
    estado: estadoUI,
    zona: backendMesa.zona || "General",
    ordenId: backendMesa.ordenId || backendMesa.orderId || null,
    meseroId: backendMesa.meseroId,
    nombreMesero: backendMesa.nombreMesero || undefined,
    fotoPerfilMesero: backendMesa.fotoPerfilMesero || undefined,
    meseroDisponible: backendMesa.meseroDisponible ?? false,
    fechaHoraInicioOcupacion: backendMesa.fechaHoraInicioOcupacion || undefined,
  };
};

export const mesasApi = {
  getMesas: async (token: string): Promise<Mesa[]> => {
    try {
      const response = await fetch(`${API_URL}/tables`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada");
        throw new Error("Error al obtener mesas");
      }

      const mesasData: MesaBackend[] = await response.json();

      return mesasData.map(adaptarMesa);
    } catch (error: any) {
      if (error.message.includes("Sesión expirada")) {
        console.log("🟡 Sesión expirada detectada en API (esperando refresh)");
      } else {
        console.error("Error en getMesas:", error);
      }
      throw error;
    }
  },

  ocuparMesa: async (
    mesaId: number,
    comensales: number,
    token: string
  ): Promise<any> => {
    const url = `${API_URL}/orders`;

    const tokenDebug =
      typeof token === "string" ? token.substring(0, 10) : "INVALID_TOKEN";

    const payload = {
      tipoOrden: "ComerAqui",
      mesasIds: [Number(mesaId)],
      comensales: Number(comensales),
      detallesOrden: null,
      pago: null,
    };

    console.log("📡 POST ->", url);
    console.log("🔑 Token Preview:", tokenDebug);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("🔴 Error en ocuparMesa:", error.message);
      throw error;
    }
  },

  agregarProductosOrden: async (
    orderId: number,
    items: any[],
    comensalNombre: string,
    token: string
  ): Promise<void> => {
    const payload = {
      comensal: comensalNombre,
      orderDetailDTOs: items.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        complementosIds: [],
        exclusionProductoIds: [],
        comentario: item.comentario || "",
      })),
    };

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
        console.error("🔴 Error del backend:", errorText);
        throw new Error(errorText || `Error ${response.status}`);
      }
    } catch (error: any) {
      console.error("Error en agregarProductosOrden:", error.message);
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

  getMesaById: async (mesaId: number, token: string): Promise<Mesa> => {
    const response = await fetch(`${API_URL}/tables/${mesaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Mesa no encontrada");
    const data = await response.json();
    return adaptarMesa(data);
  },

  actualizarEstadoProducto: async (
    orderId: number,
    detalleId: number,
    nuevoEstado: string,
    token: string
  ): Promise<void> => {
    const url = `${API_URL}/orders/${orderId}/details`;

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          detallesOrdenIds: [detalleId],
          estadoDetalleOrden: nuevoEstado,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      console.log("✅ Estado actualizado correctamente en el servidor");
    } catch (error: any) {
      console.error("🔴 Error en actualizarEstadoProducto:", error.message);
      throw error;
    }
  },

  finalizarPedido: async (orderId: number, token: string): Promise<void> => {
    const url = `${API_URL}/orders/${orderId}/checkout`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Length": "0",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔴 ERROR 500 - DETALLE:", errorText);
        throw new Error(errorText || `Error ${response.status}`);
      }

      console.log("✅ Checkout exitoso.");
    } catch (error: any) {
      console.error("🔴 Error en finalizarPedido:", error.message);
      throw error;
    }
  },

  getZonasActivas: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${API_URL}/zones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.filter((z: any) => z.estado === "Activa");
    } catch (error) {
      console.error("Error cargando zonas:", error);
      return [];
    }
  },

  liberarMesa: async (
    mesaId: number,
    zonaId: number,
    token: string
  ): Promise<void> => {
    const url = `${API_URL}/tables/${mesaId}`;
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          zonaId: Number(zonaId),
          estadoMesa: "Libre",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }
    } catch (error: any) {
      console.error("🔴 Error en liberarMesa:", error.message);
      throw error;
    }
  },
};
