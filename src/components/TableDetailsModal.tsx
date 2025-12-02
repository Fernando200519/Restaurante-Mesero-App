// src/components/TableDetailsModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  FlatList,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Mesa } from "../types/mesa";
import { mesasApi } from "../api/mesasApi"; // Asegúrate de importar la API
import { useAuth } from "../context/AuthContext";

interface Props {
  visible: boolean;
  mesa: Mesa | null;
  onClose: () => void;
  onManageOrder: () => void; // Para ir a ComandaScreen
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function TableDetailsModal({
  visible,
  mesa,
  onClose,
  onManageOrder,
}: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Animación de entrada
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
      }).start();

      // Cargar items si hay orden
      if (mesa && mesa.orderId && token) {
        setLoading(true);
        mesasApi
          .getDetalleOrden(mesa.orderId, token)
          .then((data) => setItems(data))
          .catch((err) => console.log(err))
          .finally(() => setLoading(false));
      }
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
      setItems([]);
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
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <Pressable style={{ width: "100%" }} onPress={() => {}}>
            {/* Header del Modal */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{mesa.nombre}</Text>
                <Text style={styles.subtitle}>
                  Orden #{mesa.orderId} • {mesa.ocupantes} Personas
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Lista de Items Activos */}
            <Text style={styles.sectionTitle}>Productos Activos</Text>

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
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.producto}</Text>
                      <Text style={styles.itemComensal}>{item.comensal}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>
                        {item.estado || "Solicitado"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.divider} />

            {/* Botón para ir a la Comanda Completa */}
            <TouchableOpacity style={styles.actionBtn} onPress={onManageOrder}>
              <Text style={styles.actionBtnText}>
                Gestionar Orden / Agregar
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#1A1A1A" },
  subtitle: { fontSize: 14, color: "#757575" },
  closeButton: { padding: 8, backgroundColor: "#F5F5F5", borderRadius: 50 },
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: { fontSize: 15, fontWeight: "600", color: "#333" },
  itemComensal: { fontSize: 12, color: "#999" },
  statusBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
