import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { mesasApi } from "../api/mesasApi";
import { ComensalLocal } from "../types/comensal";

export const useComensales = (orderId: number, token: string | null) => {
  const [comensales, setComensales] = useState<ComensalLocal[]>([
    { id: 1, nombre: "Comensal 1", total: 0, itemsCount: 0, items: [] },
  ]);

  const [fullOrderData, setFullOrderData] = useState<any>(null);
  const [isPreparingSettlement, setIsPreparingSettlement] = useState(false);

  const fetchOrdenActual = useCallback(async () => {
    if (!orderId || !token) return;

    try {
      const data = await mesasApi.getOrdenCompleta(orderId, token);
      if (!data) return;

      setFullOrderData(data);

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
        const realesLocales = prevLocal.filter(
          (p) =>
            p.items.length === 0 &&
            !nombresDelServidor.includes(p.nombre) &&
            p.nombre !== "Comensal 1"
        );
        return [...listaHidratada, ...realesLocales];
      });
    } catch (error) {
      console.error("Error hidratando orden:", error);
    }
  }, [orderId, token]);

  const agregarComensal = () =>
    setComensales((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        nombre: `Comensal ${prev.length + 1}`,
        total: 0,
        itemsCount: 0,
        items: [],
      },
    ]);

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

  const cancelarProducto = async (detalleId: number) => {
    if (!token) return;
    try {
      await mesasApi.actualizarEstadoProducto(
        orderId,
        detalleId,
        "Cancelado",
        token
      );
      await fetchOrdenActual();
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la cancelación.");
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

    const yaEstaCerrada =
      fullOrderData?.estado === "Checkout" || fullOrderData?.totalPendiente > 0;

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
    agregarComensal,
    eliminarComensal,
    renombrarComensal,
    entregarProducto,
    cancelarProducto,
    solicitarCuenta,
    cerrarYPrepararPago,
    ejecutarPago,
    prepararLiquidacion,
    fullOrderData,
    isPreparingSettlement,
  };
};
