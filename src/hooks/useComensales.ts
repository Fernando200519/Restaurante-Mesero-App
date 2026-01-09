import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { mesasApi } from "../api/mesasApi";
import { ComensalLocal } from "../types/comensal";

export const useComensales = (orderId: number, token: string | null) => {
  const [comensales, setComensales] = useState<ComensalLocal[]>([
    { id: 1, nombre: "Comensal 1", total: 0, itemsCount: 0, items: [] },
  ]);

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
          const items = detalles.filter((d: any) => d.comensal === nombre);
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

  return {
    comensales,
    fetchOrdenActual,
    agregarComensal,
    eliminarComensal,
    renombrarComensal,
    entregarProducto,
    cancelarProducto,
    solicitarCuenta,
  };
};
