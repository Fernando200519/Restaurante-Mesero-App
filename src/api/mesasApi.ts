import { Mesa, MesaBackend, FormDataResponse } from "../types/mesa";

// Ajusta a la IP de tu backend real
const API_URL = "http://137.184.191.81";

// --- ADAPTADOR: Transforma el "Idioma Backend" al "Idioma UI" ---
const adaptarMesa = (
  backendMesa: MesaBackend,
  zonasMap: Record<number, string>
): Mesa => {
  // 1. Mapear Estado (Backend -> UI)
  let estadoUI: Mesa["estado"] = "disponible";
  const estadoBack = backendMesa.estado?.toUpperCase() || "LIBRE";

  if (estadoBack === "OCUPADA") estadoUI = "ocupada";
  else if (estadoBack === "ESPERANDO") estadoUI = "esperando";
  else if (estadoBack === "AGRUPADA") estadoUI = "agrupada";
  else estadoUI = "disponible"; // Default para "Libre"

  // 2. Construir objeto Mesa
  return {
    id: backendMesa.id.toString(), // Convertimos number -> string
    nombre: `Mesa ${backendMesa.id}`, // Backend no manda nombre, lo generamos
    capacidad: backendMesa.capacidad,

    // Lógica simple: si hay cuenta activa, asumimos ocupantes = capacidad (o 1)
    // Idealmente el backend debería mandar este dato exacto
    ocupantes: backendMesa.totalCuentaActiva ? backendMesa.capacidad : 0,

    estado: estadoUI,

    // Buscamos el nombre de la zona usando el ID
    zona: zonasMap[backendMesa.zonaId] || "Sin Zona",

    // Datos simulados porque el endpoint /tables no los trae aún
    alerta: false,
    mesero: null,
  };
};

export const fetchMesas = async (): Promise<Mesa[]> => {
  try {
    // 1. Hacemos las dos peticiones en paralelo (Mesas y Nombres de Zonas)
    const [mesasRes, configRes] = await Promise.all([
      fetch(`${API_URL}/tables`),
      fetch(`${API_URL}/tables/form-data`),
    ]);

    if (!mesasRes.ok || !configRes.ok) {
      throw new Error("Error conectando con el servidor");
    }

    const mesasData: MesaBackend[] = await mesasRes.json();
    const configData: FormDataResponse = await configRes.json();

    // 2. Crear un mapa de Zonas para búsqueda rápida { 1: "Terraza", 2: "Barra" }
    const zonasMap: Record<number, string> = {};
    configData.zonas.forEach((z) => {
      zonasMap[z.id] = z.nombre;
    });

    // 3. FILTRADO Y MAPEO
    return (
      mesasData
        // ✅ PASO CLAVE: Filtramos las mesas que NO tengan zona (zonaId === null)
        // También filtramos si tienen una zona ID que ya no existe en el mapa (zonasMap[m.zonaId])
        .filter((m) => m.zonaId !== null && zonasMap[m.zonaId])
        .map((m) => adaptarMesa(m, zonasMap))
    );
  } catch (error) {
    console.error("Error en fetchMesas:", error);
    return []; // Retorna vacío para no romper la UI en caso de error
  }
};
