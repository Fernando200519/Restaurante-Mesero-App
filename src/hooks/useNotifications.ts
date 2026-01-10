import { useState, useEffect, useCallback, useRef } from "react";
import { notificationsApi } from "../api/notificacionApi";
import { NotificationItem } from "../types/notification";
import { Vibration } from "react-native";
import { useAuth } from "../context/AuthContext";
import { mesasApi } from "../api/mesasApi";

export function useNotifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const prevUnreadCount = useRef(0);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationsApi.getNotifications(token);
      const currentUnread = data.filter((n) => !n.leido).length;

      if (currentUnread > prevUnreadCount.current) {
        Vibration.vibrate([0, 400, 200, 400]);
      }

      prevUnreadCount.current = currentUnread;
      setNotifications(data);
      setUnreadCount(currentUnread);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id: number) => {
    if (!token) return;
    try {
      await notificationsApi.markAsRead(token, id);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationInteraction = async (
    item: NotificationItem,
    navigation: any,
    onClose: () => void
  ) => {
    markRead(item.id);

    const match = item.mensaje.match(/Mesa\s+(\d+)/);

    if (match && match[1]) {
      const mesaIdNum = parseInt(match[1]);

      try {
        const mesaData = await mesasApi.getMesaById(mesaIdNum, token!);

        if (mesaData.ordenId) {
          onClose();
          navigation.navigate("Comanda", {
            orderId: mesaData.ordenId,
            mesaNombre: mesaData.nombre,
            numComensales: mesaData.comensales,
          });
        }
      } catch (error) {
        console.log("No se pudo navegar: mesa no disponible u ocupada");
      }
    }
  };

  return {
    notifications,
    unreadCount,
    markRead,
    handleNotificationInteraction,
  };
}
