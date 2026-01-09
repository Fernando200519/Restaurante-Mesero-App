import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ComensalLocal } from "../types/comensal";
import { calcularHaceCuanto } from "../utils/time";
import { COLORS, SPACING } from "../constants/theme";

interface Props {
  item: ComensalLocal;
  onEdit: () => void;
  onDelete: () => void;
  onAddProducts: () => void;
  onDeliverProduct: (detalleId: number) => void;
  onCancelProduct: (detalleId: number, estadoActual: string) => void; // ✅ Nueva Prop
}

const getStatusConfig = (estado: string) => {
  const s = (estado || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();

  switch (s) {
    case "SOLICITADO":
      return { color: "#3B82F6", icon: "time-outline", label: "Solicitado" };
    case "ENPREPARACION":
      return {
        color: "#FA9623",
        icon: "restaurant-outline",
        label: "En cocina",
      };
    case "LISTOPARAENTREGAR":
      return {
        color: "#10B981",
        icon: "checkmark-circle-outline",
        label: "Listo",
      };
    case "ENTREGADO":
      return { color: "#374151", icon: "checkbox-outline", label: "Entregado" };
    case "CANCELADO":
      return {
        color: "#EF4444",
        icon: "close-circle-outline",
        label: "Cancelado",
      };
    default:
      return {
        color: COLORS.text.muted,
        icon: "help-circle-outline",
        label: estado,
      };
  }
};

export const ComensalCard = ({
  item,
  onEdit,
  onDelete,
  onAddProducts,
  onDeliverProduct,
  onCancelProduct,
}: Props) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onEdit}
          style={styles.nameContainer}
          activeOpacity={0.6}
        >
          <Text style={styles.cardName}>{item.nombre}</Text>
          <View style={styles.editIconCircle}>
            <Ionicons name="pencil" size={10} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {item.items.length === 0 && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.productsList}>
        {item.items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.noItemsText}>Sin productos asignados</Text>
          </View>
        ) : (
          item.items.map((prod, i) => {
            const status = getStatusConfig(prod.estado);
            // ✅ NORMALIZACIÓN: Detectamos si está listo para entregar
            const sClean = (prod.estado || "")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, "")
              .toUpperCase();

            const isReady = sClean === "LISTOPARAENTREGAR";
            return (
              <View key={prod.id || i} style={styles.productRow}>
                <View style={styles.productMainInfo}>
                  {/* Botón de entregado (Checkmark) solo si está LISTO */}
                  {isReady && (
                    <TouchableOpacity
                      style={styles.deliverActionBtn}
                      onPress={() => onDeliverProduct(prod.id)}
                    >
                      <Ionicons
                        name="checkmark-done-circle"
                        size={24}
                        color="#10B981"
                      />
                    </TouchableOpacity>
                  )}

                  <Text style={styles.productText} numberOfLines={1}>
                    {prod.producto}
                  </Text>

                  {/* ✅ BOTÓN DE CANCELACIÓN: Visible si no está ya cancelado */}
                  {prod.estado !== "Cancelado" && (
                    <TouchableOpacity
                      onPress={() => onCancelProduct(prod.id, prod.estado)}
                      style={styles.cancelBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={COLORS.error}
                      />
                    </TouchableOpacity>
                  )}
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${status.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={status.icon as any}
                      size={12}
                      color={status.color}
                    />
                    <Text style={[styles.statusLabel, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.productMeta}>
                  <Text style={styles.itemPrice}>${prod.total.toFixed(2)}</Text>
                  <Text style={styles.timeText}>
                    {calcularHaceCuanto(prod.fechaHoraInicioEstado)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.totalSummary}>
          <Text style={styles.totalLabel}>Subtotal comensal:</Text>
          <Text style={styles.totalAmount}>${item.total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          onPress={onAddProducts}
          style={styles.addAction}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color={COLORS.white} />
          <Text style={styles.addActionText}>Añadir más</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  nameContainer: { flexDirection: "row", alignItems: "center" },
  cardName: { fontSize: 20, fontWeight: "800", color: COLORS.text.primary },
  editIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  deleteBtn: { padding: 4 },
  productsList: { marginBottom: SPACING.m },
  productRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  productMainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  productText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  statusLabel: { fontSize: 11, fontWeight: "700", marginLeft: 4 },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: { fontSize: 13, color: COLORS.text.secondary, fontWeight: "700" },
  timeText: { fontSize: 11, color: COLORS.text.muted, fontWeight: "500" },
  emptyState: { paddingVertical: 10, alignItems: "center" },
  noItemsText: { color: COLORS.text.muted, fontStyle: "italic", fontSize: 13 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.s,
    paddingTop: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  totalSummary: { flex: 1 },
  totalLabel: { fontSize: 11, color: COLORS.text.muted, fontWeight: "600" },
  totalAmount: { fontSize: 16, fontWeight: "900", color: COLORS.primary },
  addAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addActionText: {
    color: COLORS.white,
    fontWeight: "800",
    marginLeft: 6,
    fontSize: 13,
  },
  deliverActionBtn: {
    marginRight: 8,
    padding: 2,
  },
  cancelBtn: {
    padding: 6,
    marginLeft: 8,
  },
});
