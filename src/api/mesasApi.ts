// src/api/mesasApi.ts
import { Mesa, MesaBackend } from "../types/mesa";

const API_URL = "http://137.184.191.81"; // Tu IP

// --- ADAPTADOR: Nuevo JSON -> UI ---
const adaptarMesa = (backendMesa: MesaBackend): Mesa => {
  // 1. Normalizar Estado (Backend "Ocupada" -> Frontend "ocupada")
  let estadoUI: Mesa["estado"] = "disponible";
  const estadoBack = backendMesa.estado?.toUpperCase() || "LIBRE";

  if (estadoBack === "OCUPADA") estadoUI = "ocupada";
  else if (estadoBack === "ESPERANDO") estadoUI = "esperando";
  else if (estadoBack === "AGRUPADA") estadoUI = "agrupada";

  // 2. Construir objeto Mesa
  return {
    id: backendMesa.id.toString(),
    nombre: `Mesa ${backendMesa.id}`,
    capacidad: backendMesa.capacidad,

    // Ahora usamos el dato directo del backend
    ocupantes: backendMesa.comensales || 0,

    estado: estadoUI,

    // Ya viene el nombre directo, no hace falta mapa de zonas
    zona: backendMesa.nombreZona || "General",

    // 👇 1. Restauramos la alerta en falso (para que no de error)
    alerta: false,

    // 👇 2. Mapeamos correctamente el mesero para que coincida con MesaCard
    mesero: backendMesa.fotoPerfilMesero
      ? {
          nombre: "Mesero", // El backend no manda nombre aquí, ponemos genérico
          online: backendMesa.esMeseroActivo || false,
          avatarUrl: backendMesa.fotoPerfilMesero, // 👈 AQUÍ ESTÁ LA SOLUCIÓN DE LA IMAGEN
        }
      : null,
    // 👇 AGREGA ESTA LÍNEA EN EL RETURN:
    orderId: backendMesa.orderId,
  };
};

export const mesasApi = {
  getMesas: async (token: string): Promise<Mesa[]> => {
    try {
      // 1. Petición ÚNICA (Ya no necesitamos /form-data)
      const response = await fetch(`${API_URL}/tables`, {
        // Asumo que el endpoint es /tables o /mesas
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

      // 2. Mapeo Directo
      return mesasData.map(adaptarMesa);
    } catch (error) {
      console.error("Error en getMesas:", error);
      throw error;
    }
  },
  // 👇 NUEVA FUNCIÓN PARA OCUPAR MESA
  ocuparMesa: async (
    mesaId: number,
    empleadoId: number,
    comensales: number,
    token: string
  ): Promise<any> => {
    // Puedes tipar el retorno si sabes qué devuelve el backend

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Tu pase VIP
        },
        // El cuerpo exacto que pide tu imagen:
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

      // Si devuelve un JSON con la orden creada, lo retornamos
      return await response.json();
    } catch (error) {
      console.error("Error en ocuparMesa:", error);
      throw error;
    }
  },
  // 👇 NUEVA FUNCIÓN PARA AGREGAR PRODUCTOS
  agregarProductosOrden: async (
    orderId: number,
    items: any[], // Tu carrito local
    empleadoId: number,
    comensalNombre: string,
    token: string
  ): Promise<void> => {
    // 1. Transformamos el Carrito al formato del Backend
    // El backend espera un ARRAY de objetos
    const payload = items.map((item) => ({
      productoId: item.producto.id,
      empleadoId: empleadoId,
      cantidad: item.cantidad,
      comensal: comensalNombre, // "Juan" o "Comensal 1"
      // Nota: Aquí omitimos "notas" u "opciones" porque el back no las soporta aún
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

      // Si todo sale bien, no necesitamos retornar nada, solo que no falle
    } catch (error) {
      console.error("Error en agregarProductosOrden:", error);
      throw error;
    }
  },
  getDetalleOrden: async (orderId: number, token: string): Promise<any[]> => {
    try {
      // Usamos la ruta /details que mostraste en la imagen
      const response = await fetch(`${API_URL}/orders/${orderId}/details`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener detalles");

      // La respuesta es un array directo segun tu imagen
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },
};
