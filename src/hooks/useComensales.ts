import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { mesasApi } from "../api/mesasApi";
import { ComensalLocal } from "../types/comensal";

export const useComensales = (orderId: number, token: string | null) => {
  const [mesaFullData, setMesaFullData] = useState<any>(null);
  const [comensales, setComensales] = useState<ComensalLocal[]>([
    { id: 1, nombre: "Comensal 1", total: 0, itemsCount: 0, items: [] },
  ]);

  const [fullOrderData, setFullOrderData] = useState<any>(null);
  const [mesaEstado, setMesaEstado] = useState<string>("ocupada");
  const [isPreparingSettlement, setIsPreparingSettlement] = useState(false);

  const fetchOrdenActual = useCallback(async () => {
    if (!orderId || !token) return;

    try {
      const data = await mesasApi.getOrdenCompleta(orderId, token);
      if (!data) return;
      setFullOrderData(data);

      if (data.mesasIds && data.mesasIds.length > 0) {
        const mesaInfo = await mesasApi.getMesaById(data.mesasIds[0], token);
        setMesaFullData(mesaInfo);
        setMesaEstado(mesaInfo.estado);
      }

      const detalles = data.detallesOrden || [];
      const nombresDelServidor = [
        ...new Set(detalles.map((d: any) => d.comensal)),
      ];

      const listaHidratada: ComensalLocal[] = nombresDelServidor.map(
        (nombre: any, index: number) => {
          const items = detalles
            .filter((d: any) => d.comensal === nombre)
            .map((item: any) => ({
              ...item,
              comentario: item.comentario || item.notas || "",
              complementos: item.complementos || [],
              exclusiones: item.exclusiones || [],
            }));

          return {
            id: `server-${index}`,
            nombre: nombre || `Comensal ${index + 1}`,
            total: items.reduce(
              (acc: number, i: any) => acc + (i.total || 0),
              0
            ),
            itemsCount: items.length,
            items: items,
          };
        }
      );

      setComensales((prevLocal) => {
        const manualesAgregadosRecientemente = prevLocal.filter(
          (p) => !nombresDelServidor.includes(p.nombre) && p.id !== 1
        );

        if (listaHidratada.length > 0) {
          return [...listaHidratada, ...manualesAgregadosRecientemente];
        }

        return prevLocal;
      });
    } catch (error) {
      console.error("Error hidratando orden:", error);
    }
  }, [orderId, token]);

  const agregarComensal = () =>
    setComensales((prev) => {
      const soloExisteDummy = prev.length === 1 && prev[0].id === 1;
      const nuevo = {
        id: `local-${Date.now()}`,
        nombre: `Comensal ${soloExisteDummy ? 1 : prev.length + 1}`,
        total: 0,
        itemsCount: 0,
        items: [],
      };
      return soloExisteDummy ? [nuevo] : [...prev, nuevo];
    });

  const eliminarComensal = (id: string | number) => {
    setComensales((prev) => prev.filter((c) => c.id !== id));
  };

  const renombrarComensal = (id: string | number, nombre: string) => {
    setComensales((prev) =>
      prev.map((c) => (c.id === id ? { ...c, nombre } : c))
    );
  };

  const entregarProducto = async (detalleId: number) => {
    if (!token) return;
    try {
      await mesasApi.actualizarEstadoProducto(
        orderId,
        detalleId,
        "Entregado",
        token
      );

      await fetchOrdenActual();
    } catch (error) {
      Alert.alert("Error", "No se pudo marcar como entregado.");
    }
  };

  const gestionarIncidenciaProducto = async (
    detalleId: number,
    tipo: "Cancelacion" | "Reposicion" | "ReposicionNuevo",
    datosReemplazo?: any
  ) => {
    if (!token) return;

    try {
      const payload: any = {
        tipoCancelacion: tipo,
        motivo:
          tipo === "Cancelacion"
            ? "Solicitud del cliente"
            : "Incidencia en platillo",
        motivoDetallado: "Procesado desde la aplicación móvil de mesero",
        nuevoDetalleOrden:
          tipo === "Reposicion" || tipo === "ReposicionNuevo"
            ? datosReemplazo
            : null,
      };

      console.log("📡 Enviando Incidencia:", JSON.stringify(payload, null, 2));

      await mesasApi.cancelarDetalleAvanzado(detalleId, token, payload);
      await fetchOrdenActual();
      return true;
    } catch (error: any) {
      console.error("🔴 Error en incidencia:", error.message);
      Alert.alert(
        "Error",
        "No se pudo procesar la incidencia. Revisa la consola."
      );
      return false;
    }
  };
  const solicitarCuenta = async (onSuccess: () => void) => {
    if (!token) return;
    try {
      await mesasApi.finalizarPedido(orderId, token);
      onSuccess();
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo solicitar la cuenta. Revisa la conexión."
      );
    }
  };

  const cerrarYPrepararPago = async (onReadyForPayment: () => void) => {
    if (!token) return;
    try {
      await mesasApi.finalizarPedido(orderId, token);
      onReadyForPayment();
    } catch (error) {
      Alert.alert("Error", "No se pudo cerrar la orden.");
    }
  };

  const ejecutarPago = async (
    config: {
      tipoPago: "Efectivo" | "Tarjeta";
      montoPagado: number;
      detallesIds: number[];
      propina: number;
    },
    onSuccess: () => void
  ) => {
    if (!token) return;

    try {
      const payload = {
        tipoPago: config.tipoPago,
        detallesIds: config.detallesIds,
        propina: config.propina,
        tarjeta: {
          estado: "Pendiente",
        },
        efectivo:
          config.tipoPago === "Efectivo"
            ? { recibido: config.montoPagado }
            : null,
      };

      console.log(
        "📡 Enviando Pago corregido:",
        JSON.stringify(payload, null, 2)
      );

      await mesasApi.registrarPago(orderId, token, payload);
      await fetchOrdenActual();
      onSuccess();
    } catch (error: any) {
      console.error("🔴 Error detallado en registrarPago:", error.message);
      Alert.alert(
        "Error de Pago",
        "El servidor requiere datos específicos. Verifica el monto e intenta de nuevo."
      );
    }
  };

  const prepararLiquidacion = async () => {
    if (!token) return null;

    const yaEstaCerrada = mesaEstado === "esperando";

    setIsPreparingSettlement(true);
    try {
      if (!yaEstaCerrada) {
        await mesasApi.finalizarPedido(orderId, token);
      }

      const data = await mesasApi.getOrdenCompleta(orderId, token);
      setFullOrderData(data);
      return data;
    } catch (error) {
      Alert.alert("Error", "No se pudo preparar la cuenta.");
      return null;
    } finally {
      setIsPreparingSettlement(false);
    }
  };

  return {
    comensales,
    fetchOrdenActual,
    mesaEstado,
    mesaFullData,
    agregarComensal,
    eliminarComensal,
    renombrarComensal,
    entregarProducto,
    gestionarIncidenciaProducto,
    solicitarCuenta,
    cerrarYPrepararPago,
    ejecutarPago,
    prepararLiquidacion,
    fullOrderData,
    isPreparingSettlement,
  };
};
