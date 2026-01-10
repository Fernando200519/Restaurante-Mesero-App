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
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Mesa } from "../types/mesa";
import { mesasApi } from "../api/mesasApi";
import { useAuth } from "../context/AuthContext";
import { COLORS, SPACING } from "../constants/theme";
import { useMesas } from "../hooks/useMesas";

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
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [tiempoInfo, setTiempoInfo] = useState<{
    inicio: string;
    transcurrido: string;
  } | null>(null);

  const { liberarMesa } = useMesas();
  const [isLiberating, setIsLiberating] = useState(false);

  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const isMyTable = mesa?.meseroId === user?.id;
  const nombreMesero = mesa?.nombreMesero || "Sin asignar";
  const totalMesa = items.reduce((acc, item) => acc + (item.total || 0), 0);

  const parseBackendDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    try {
      const normalized = dateStr.replace(/\+\d{2}:\d{2}$/, "Z");
      const d = new Date(normalized);
      return isNaN(d.getTime()) ? null : d;
    } catch (e) {
      return null;
    }
  };

  const calcularRelativo = (fechaInicio: Date) => {
    const ahora = new Date();
    const diff = Math.max(0, ahora.getTime() - fechaInicio.getTime());
    const minTotal = Math.floor(diff / 60000);

    if (minTotal < 60) return `${minTotal} min`;
    const horas = Math.floor(minTotal / 60);
    const mins = minTotal % 60;
    return `${horas}h ${mins}m`;
  };

  const handleLiberar = async () => {
    if (!mesa) return;
    setIsLiberating(true);
    try {
      await liberarMesa(mesa.id, mesa.zona);
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo liberar la mesa.");
    } finally {
      setIsLiberating(false);
    }
  };

  useEffect(() => {
    if (visible && mesa) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 150,
      }).start();

      if (mesa.fechaHoraInicioOcupacion) {
        const inicio = parseBackendDate(mesa.fechaHoraInicioOcupacion);

        if (inicio) {
          setTiempoInfo({
            inicio: inicio.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            transcurrido: calcularRelativo(inicio),
          });
        }
      }

      if (mesa.ordenId && token) {
        setLoading(true);
        mesasApi
          .getDetalleOrden(mesa.ordenId, token)
          .then((response) => setItems(response || []))
          .catch(() => console.log("Error al cargar detalles"))
          .finally(() => setLoading(false));
      }
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
      setItems([]);
      setTiempoInfo(null);
    }
  }, [visible, mesa, token]);

  // Dentro de TableDetailsModal.tsx
  const isPorLiberar = mesa?.estado === "liberar";

  if (!mesa) return null;

  const normalizeStatus = (estado: string) => {
    return (estado || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .toUpperCase();
  };

  const getStatusColor = (estado: string) => {
    const s = normalizeStatus(estado);
    switch (s) {
      case "SOLICITADO":
        return "#3B82F6";
      case "ENPREPARACION":
        return "#FA9623";
      case "LISTOPARAENTREGAR":
        return "#10B981";
      case "ENTREGADO":
        return "#374151";
      case "CANCELADO":
        return "#EF4444";
      default:
        return COLORS.text.muted;
    }
  };

  const getFriendlyLabel = (estado: string) => {
    const s = normalizeStatus(estado);
    if (s === "ENPREPARACION") return "En cocina";
    if (s === "LISTOPARAENTREGAR") return "Listo";
    return estado;
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.mainContainer}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{mesa.nombre}</Text>
              <View style={styles.row}>
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={COLORS.text.secondary}
                />
                <Text style={styles.subtitle}>{mesa.comensales} Personas</Text>
              </View>
            </View>
            <View style={styles.totalBadge}>
              <Text style={styles.totalLabel}>Consumo Total</Text>
              <Text style={styles.totalAmount}>${totalMesa.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={18} color={COLORS.primary} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.infoLabel}>Tiempo</Text>
                <Text style={styles.infoValue}>
                  {tiempoInfo?.transcurrido || "0 min"}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View
                style={[
                  styles.avatarMini,
                  {
                    backgroundColor: isMyTable
                      ? COLORS.primary
                      : COLORS.surface,
                  },
                ]}
              >
                {mesa.fotoPerfilMesero ? (
                  <Image
                    source={{ uri: mesa.fotoPerfilMesero }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={12}
                    color={isMyTable ? COLORS.white : COLORS.text.muted}
                  />
                )}
              </View>
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.infoLabel}>Mesero</Text>
                <Text
                  style={[
                    styles.infoValue,
                    isMyTable && { color: COLORS.primary },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {nombreMesero}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Consumo</Text>

          <View style={{ flexShrink: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {loading ? (
                <ActivityIndicator
                  color={COLORS.primary}
                  style={{ margin: 30 }}
                />
              ) : (
                items.map((item, index) => {
                  const color = getStatusColor(item.estado);
                  return (
                    <View key={index} style={styles.productRow}>
                      <View style={styles.qtyBox}>
                        <Text style={styles.qtyText}>1</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.productName}>{item.producto}</Text>
                        <Text style={styles.productMeta}>{item.comensal}</Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>
                          ${item.total.toFixed(2)}
                        </Text>
                        <View
                          style={[
                            styles.statusPill,
                            { backgroundColor: `${color}15` },
                          ]}
                        >
                          <Text
                            style={[styles.statusPillText, { color: color }]}
                          >
                            {getFriendlyLabel(item.estado)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: isPorLiberar
                  ? "#3B82F6"
                  : isMyTable
                  ? COLORS.primary
                  : "#6B7280",
              },
            ]}
            onPress={isPorLiberar ? handleLiberar : onManageOrder}
            disabled={isLiberating}
          >
            {isLiberating ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.actionBtnText}>
                  {isPorLiberar
                    ? "Limpiar y Liberar Mesa"
                    : isMyTable
                    ? "Gestionar Pedido"
                    : "Ver Detalle"}
                </Text>
                <Ionicons
                  name={isPorLiberar ? "brush-outline" : "chevron-forward"}
                  size={20}
                  color={COLORS.white}
                />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.s,
    paddingBottom: 40,
    maxHeight: "88%",
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: SPACING.m,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.l,
  },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.text.primary },
  subtitle: { fontSize: 14, color: COLORS.text.secondary, marginLeft: 5 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  totalBadge: {
    alignItems: "flex-end",
    backgroundColor: "#F1F8E9",
    padding: 10,
    borderRadius: 16,
  },
  totalLabel: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  totalAmount: { fontSize: 22, fontWeight: "900", color: "#2E7D32" },
  infoGrid: { flexDirection: "row", gap: 12, marginBottom: SPACING.l },
  infoCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.text.muted,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  infoValue: { fontSize: 13, color: COLORS.text.primary, fontWeight: "700" },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginBottom: SPACING.l },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: SPACING.m,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFAFA",
  },
  qtyBox: {
    width: 30,
    height: 30,
    backgroundColor: "#FFF4E6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: { color: COLORS.primary, fontWeight: "bold", fontSize: 14 },
  productName: { fontSize: 15, fontWeight: "600", color: COLORS.text.primary },
  productMeta: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  priceContainer: { alignItems: "flex-end" },
  priceText: { fontSize: 14, fontWeight: "700", color: COLORS.text.primary },
  statusPill: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusPillText: {
    fontSize: 9,
    color: "#1976D2",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  emptyState: { alignItems: "center", padding: 40 },
  emptyText: { color: COLORS.text.muted, fontSize: 14, textAlign: "center" },
  actionBtn: {
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.m,
    elevation: 5,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
    marginRight: 8,
  },
});
