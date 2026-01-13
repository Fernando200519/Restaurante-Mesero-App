import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";

interface Props {
  visible: boolean;
  item: any;
  onClose: () => void;
  onAction: (
    tipo: "Cancelacion" | "Reposicion" | "ReposicionNuevo",
    cantidad?: number
  ) => void;
}

export const ProductIncidentModal = ({
  visible,
  item,
  onClose,
  onAction,
}: Props) => {
  if (!item) return null;

  // Lógica de cargos según el backend
  const s = (item.estado || "").toUpperCase().replace(/\s+/g, "");
  const generaCargo = s === "LISTOPARAENTREGAR" || s === "ENTREGADO";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Gestión de Incidencia</Text>
          <Text style={styles.productName}>{item.producto}</Text>
          <Text style={styles.statusInfo}>Estado actual: {item.estado}</Text>

          <View style={styles.options}>
            {/* CASO 1: CANCELACIÓN */}
            <TouchableOpacity
              style={styles.optionBtn}
              onPress={() => onAction("Cancelacion")}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
              <View style={styles.btnTextContainer}>
                <Text style={styles.btnTitle}>Cancelar permanentemente</Text>
                <Text style={styles.btnSub}>
                  {generaCargo ? "⚠️ Generará recargo" : "✓ Sin costo"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* CASO 2: REPOSICIÓN */}
            <TouchableOpacity
              style={styles.optionBtn}
              onPress={() => onAction("Reposicion")}
            >
              <Ionicons
                name="refresh-outline"
                size={24}
                color={COLORS.primary}
              />
              <View style={styles.btnTextContainer}>
                <Text style={styles.btnTitle}>Reponer (Volver a preparar)</Text>
                <Text style={styles.btnSub}>✓ Sin costo para el cliente</Text>
              </View>
            </TouchableOpacity>

            {/* CASO 3: AJUSTE DE CANTIDAD */}
            {item.cantidad > 1 && (
              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => onAction("ReposicionNuevo", item.cantidad - 1)}
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={24}
                  color="#FA9623"
                />
                <View style={styles.btnTextContainer}>
                  <Text style={styles.btnTitle}>Reducir cantidad</Text>
                  <Text style={styles.btnSub}>
                    Quitar 1 unidad de este pedido
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    color: COLORS.text.muted,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text.primary,
    marginVertical: 8,
    textAlign: "center",
  },
  statusInfo: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 20,
  },
  options: { width: "100%", gap: 12 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    backgroundColor: "#F9FAFB",
  },
  btnTextContainer: { marginLeft: 15 },
  btnTitle: { fontSize: 15, fontWeight: "800", color: COLORS.text.primary },
  btnSub: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  closeBtn: { marginTop: 20, padding: 10 },
  closeBtnText: { color: COLORS.text.muted, fontWeight: "700" },
});
