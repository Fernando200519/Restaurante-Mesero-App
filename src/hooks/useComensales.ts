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
      const detalles: any[] = await mesasApi.getDetalleOrden(orderId, token);
      if (!detalles || detalles.length === 0) return;

      const nombresDelServidor = [
        ...new Set(detalles.map((d: any) => d.comensal)),
      ];

      const listaHidratada: ComensalLocal[] = nombresDelServidor.map(
        (nombre: any, index: number) => {
          const items = detalles
            .filter((d: any) => d.comensal === nombre)
            .map((item) => ({
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
      modo: "junto" | "separado";
      tipoPago: "Efectivo" | "Tarjeta";
      propinaTotal: number;
    },
    onSuccess: () => void
  ) => {
    if (!token || !fullOrderData) {
      Alert.alert("Error", "No hay datos de la orden para procesar el pago.");
      return;
    }

    try {
      if (config.modo === "junto") {
        // ---------------------------------------------------------
        // 1. PAGO ÚNICO (TODO JUNTO)
        // ---------------------------------------------------------
        const todosLosIds = fullOrderData.detallesOrden
          .filter((d: any) => d.estado !== "Cancelado" && !d.pagado)
          .map((d: any) => d.id);

        const payload = {
          tipoPago: config.tipoPago,
          detallesIds: todosLosIds,
          propina: config.propinaTotal,
          tarjeta:
            config.tipoPago === "Tarjeta" ? { estado: "Pendiente" } : null,
          efectivo: config.tipoPago === "Efectivo" ? { recibido: 0 } : null,
        };

        await mesasApi.registrarPago(orderId, token, payload);
      } else {
        // ---------------------------------------------------------
        // 2. PAGO POR COMENSAL (SEPARADO)
        // ---------------------------------------------------------
        const comensalesUnicos = [
          ...new Set(fullOrderData.detallesOrden.map((d: any) => d.comensal)),
        ];

        for (const nombre of comensalesUnicos) {
          const idsDeEsteComensal = fullOrderData.detallesOrden
            .filter(
              (d: any) =>
                d.comensal === nombre && d.estado !== "Cancelado" && !d.pagado
            )
            .map((d: any) => d.id);

          if (idsDeEsteComensal.length === 0) continue;

          const payload = {
            tipoPago: config.tipoPago,
            detallesIds: idsDeEsteComensal,
            propina: config.propinaTotal / comensalesUnicos.length,
            tarjeta:
              config.tipoPago === "Tarjeta" ? { estado: "Pendiente" } : null,
            efectivo: config.tipoPago === "Efectivo" ? { recibido: 0 } : null,
          };

          await mesasApi.registrarPago(orderId, token, payload);
        }
      }

      onSuccess();
    } catch (error: any) {
      console.error("🔴 Error en flujo de pago:", error.message);
      Alert.alert(
        "Error de Pago",
        "No se pudo registrar la transacción en el servidor."
      );
    }
  };

  const prepararLiquidacion = async () => {
    if (!token) return null;
    setIsPreparingSettlement(true);
    try {
      await mesasApi.finalizarPedido(orderId, token);

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
