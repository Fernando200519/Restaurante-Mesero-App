import { NotificationItem } from "../types/notification";

const API_URL = "http://137.184.191.81";

export const notificationsApi = {
  getNotifications: async (
    token: string,
    limit: number = 20
  ): Promise<NotificationItem[]> => {
    const response = await fetch(`${API_URL}/notifications?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al obtener notificaciones");
    return response.json();
  },

  markAsRead: async (token: string, id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids: [id],
          leido: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      console.log(`✅ Notificación ${id} marcada como leída exitosamente.`);
    } catch (error: any) {
      console.error("🔴 Error en markAsRead:", error.message);
      throw error;
    }
  },
};
