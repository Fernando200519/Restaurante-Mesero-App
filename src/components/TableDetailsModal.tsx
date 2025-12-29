import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Mesa } from "../types/mesa";
import { mesasApi } from "../api/mesasApi";
import { useAuth } from "../context/AuthContext";

interface Props {
  visible: boolean;
  mesa: Mesa | null;
  onClose: () => void;
  onManageOrder: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function TableDetailsModal({
  visible,
  mesa,
  onClose,
  onManageOrder,
}: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [tiempoInfo, setTiempoInfo] = useState<{
    inicio: string;
    transcurrido: string;
  } | null>(null);

  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const totalMesa = items.reduce((acc, item) => acc + (item.total || 0), 0);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const meseroNombre = mesa?.mesero?.nombre || "Sin Mesero";
  const initials = getInitials(meseroNombre);

  const calcularTiempo = (fechaIso: string) => {
    const fechaAjustada = fechaIso.endsWith("Z") ? fechaIso : fechaIso + "Z";
    const inicio = new Date(fechaAjustada);
    const ahora = new Date();
    const diff = Math.max(0, ahora.getTime() - inicio.getTime());
    const minutosTotales = Math.floor(diff / 60000);
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    const horaInicioTexto = inicio.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const transcurridoTexto =
      horas > 0 ? `${horas}h ${minutos}m` : `${minutos} min`;

    setTiempoInfo({ inicio: horaInicioTexto, transcurrido: transcurridoTexto });
  };

  const calcularHaceCuanto = (fechaIso: string | null | undefined) => {
    if (!fechaIso) return "--:--";

    const fechaAjustada = fechaIso.endsWith("Z") ? fechaIso : fechaIso + "Z";
    const inicio = new Date(fechaAjustada);
    const ahora = new Date();
    const diff = ahora.getTime() - inicio.getTime();

    if (diff < 0) return "0 min";

    const minutos = Math.floor(diff / 60000);

    if (minutos < 60) return `${minutos} min`;

    const horas = Math.floor(minutos / 60);
    const minsRestantes = minutos % 60;
    return `${horas}h ${minsRestantes}m`;
  };

  useEffect(() => {
    if (visible && mesa) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
      }).start();
      if (mesa.fechaInicio) calcularTiempo(mesa.fechaInicio);
      else setTiempoInfo(null);

      setItems([]);

      if (mesa.orderId && token) {
        setLoading(true);
        mesasApi
          .getDetalleOrden(mesa.orderId, token)
          .then((data) => {
            setItems(data || []);
          })
          .catch((err) => console.log(err))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
      setItems([]);
      setLoading(false);
      setTiempoInfo(null);
    }
  }, [visible, mesa, token]);

  if (!mesa) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      {/* 1. CONTENEDOR PRINCIPAL (Solo organiza el layout) */}
      <View style={styles.mainContainer}>
        {/* 2. EL FONDO OSCURO (Hermano 1) */}
        {/* Usamos absoluteFill para que cubra todo el fondo */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* 3. LA HOJA BLANCA (Hermano 2) */}
        {/* Al no estar dentro del Pressable anterior, ya no hay conflicto de toques */}
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* --- HEADER FIJO --- */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{mesa.nombre}</Text>
              <Text style={styles.subtitle}>{mesa.ocupantes} Personas</Text>

              {tiempoInfo && (
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.timeText}>
                    Abierta {tiempoInfo.inicio} •{" "}
                    <Text style={{ fontWeight: "bold", color: "#E65100" }}>
                      Hace {tiempoInfo.transcurrido}
                    </Text>
                  </Text>
                </View>
              )}

              {mesa.mesero && (
                <View style={styles.waiterContainer}>
                  <View style={styles.avatarCircle}>
                    {mesa.mesero.avatarUrl ? (
                      <Image
                        source={{ uri: mesa.mesero.avatarUrl }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    )}
                  </View>
                  <Text style={styles.waiterName}>
                    Atiende:{" "}
                    <Text style={{ fontWeight: "bold" }}>{meseroNombre}</Text>
                  </Text>
                </View>
              )}
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>${totalMesa.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Productos Activos</Text>

          {/* 🔥 CORRECCIÓN 2: Contenedor del ScrollView 
               'flexShrink: 1' permite que crezca, pero si choca con el borde, 
               se detiene y deja que el ScrollView interno haga su trabajo.
            */}
          <View style={{ flexShrink: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              style={{ flexGrow: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FA9623" style={{ margin: 20 }} />
              ) : items.length === 0 ? (
                <Text style={styles.emptyText}>
                  No hay productos ordenados aún.
                </Text>
              ) : (
                <View style={styles.listContainer}>
                  {items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          1x {item.producto}
                        </Text>
                        <Text style={styles.itemComensal}>{item.comensal}</Text>
                      </View>

                      <View style={{ alignItems: "flex-end", marginRight: 12 }}>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>
                            {item.estado || "Solicitado"}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 4,
                          }}
                        >
                          <Ionicons
                            name="time-outline"
                            size={12}
                            color="#999"
                          />
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#999",
                              marginLeft: 4,
                            }}
                          >
                            {calcularHaceCuanto(item.fechaHoraInicioEstado)}
                          </Text>
                        </View>
                      </View>

                      <View style={{ width: 60, alignItems: "flex-end" }}>
                        <Text style={styles.itemPrice}>${item.total}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>

          <View style={styles.divider} />

          {/* Botón Fijo */}
          <TouchableOpacity style={styles.actionBtn} onPress={onManageOrder}>
            <Text style={styles.actionBtnText}>Gestionar Orden / Agregar</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 30,
    width: "100%",
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#1A1A1A" },
  subtitle: { fontSize: 14, color: "#757575" },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  timeText: {
    fontSize: 12,
    color: "#E65100",
    marginLeft: 4,
  },
  waiterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FA9623",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  waiterName: {
    fontSize: 13,
    color: "#555",
  },
  closeButton: {
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 50,
  },
  totalContainer: {
    marginTop: 15,
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 12,
    color: "#999",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2E7D32",
  },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 15 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  listContainer: { marginBottom: 10 },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  itemComensal: {
    fontSize: 13,
    color: "#9E9E9E",
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E7D32",
  },
  statusBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { color: "#2196F3", fontSize: 11, fontWeight: "bold" },
  actionBtn: {
    backgroundColor: "#FA9623",
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
});
