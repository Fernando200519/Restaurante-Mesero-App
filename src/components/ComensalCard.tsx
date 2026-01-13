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
  onCancelProduct: (detalleId: number, estadoActual: string) => void;
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
      return { color: "#FA9623", icon: "restaurant-outline", label: "Cocina" };
    case "LISTOPARAENTREGAR":
      return { color: "#10B981", icon: "flash-outline", label: "¡LISTO!" };
    case "ENTREGADO":
      return { color: "#6B7280", icon: "checkmark-circle", label: "Entregado" };
    case "CANCELADO":
      return { color: "#EF4444", icon: "close-circle", label: "Cancelado" };
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
      {/* HEADER DEL COMENSAL */}
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
            const sClean = (prod.estado || "")
              .toUpperCase()
              .replace(/\s+/g, "");
            const isReady = sClean === "LISTOPARAENTREGAR";
            const isDelivered = sClean === "ENTREGADO";
            const isCancelled = sClean === "CANCELADO";

            return (
              <View
                key={prod.id || i}
                style={[styles.productRow, isCancelled && { opacity: 0.4 }]}
              >
                <View style={styles.productMainInfo}>
                  <View style={styles.productNameContainer}>
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyText}>{prod.cantidad}x</Text>
                    </View>
                    <Text style={styles.productText} numberOfLines={1}>
                      {prod.producto}
                    </Text>
                  </View>

                  {isReady ? (
                    <TouchableOpacity
                      style={styles.deliverActionBtn}
                      onPress={() => onDeliverProduct(prod.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="restaurant"
                        size={14}
                        color={COLORS.white}
                      />
                      <Text style={styles.deliverActionText}>ENTREGAR</Text>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${status.color}10` },
                      ]}
                    >
                      <Ionicons
                        name={status.icon as any}
                        size={12}
                        color={status.color}
                      />
                      <Text
                        style={[styles.statusLabel, { color: status.color }]}
                      >
                        {status.label}
                      </Text>
                    </View>
                  )}

                  {/* BOTÓN DE GESTIÓN (REEMPLAZA AL DE CANCELAR) */}
                  {!isCancelled && (
                    <TouchableOpacity
                      onPress={() => onCancelProduct(prod, prod.estado)}
                      style={styles.manageBtn}
                    >
                      <Ionicons
                        name={isDelivered ? "alert-circle" : "close-circle"}
                        size={24}
                        color={isDelivered ? COLORS.primary : "#EF4444"}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {Boolean(prod.comentario) && (
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteText}>Nota: {prod.comentario}</Text>
                  </View>
                )}

                {/* EXTRAS Y EXCLUSIONES */}
                <View style={styles.optionsContainer}>
                  {prod.complementos?.length > 0 && (
                    <Text style={styles.extraText}>
                      + {prod.complementos.map((c: any) => c.nombre).join(", ")}
                    </Text>
                  )}
                  {prod.exclusiones?.length > 0 && (
                    <Text style={styles.exclusionText}>
                      - {prod.exclusiones.join(", ")}
                    </Text>
                  )}
                </View>

                {/* META DATA: PRECIO Y TIEMPO */}
                <View style={styles.productMeta}>
                  <Text style={styles.itemPrice}>${prod.total.toFixed(2)}</Text>
                  <View style={styles.timeWrapper}>
                    <Ionicons
                      name="stopwatch-outline"
                      size={10}
                      color={COLORS.text.muted}
                    />
                    <Text style={styles.timeText}>
                      {calcularHaceCuanto(prod.fechaHoraInicioEstado)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.totalSummary}>
          <Text style={styles.totalLabel}>Subtotal comensal</Text>
          <Text style={styles.totalAmount}>${item.total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          onPress={onAddProducts}
          style={styles.addAction}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={COLORS.white} />
          <Text style={styles.addActionText}>Añadir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: SPACING.l,
    marginBottom: SPACING.m,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  nameContainer: { flexDirection: "row", alignItems: "center" },
  cardName: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  editIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  deleteBtn: { padding: 4 },
  productsList: { marginBottom: SPACING.s },
  productRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  productMainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  productNameContainer: { flex: 1, flexDirection: "row", alignItems: "center" },

  qtyBadge: {
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  qtyText: { fontSize: 13, fontWeight: "800", color: COLORS.primary },
  productText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: "700",
  },

  deliverActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#10B981",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  deliverActionText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 5,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusLabel: { fontSize: 11, fontWeight: "800", marginLeft: 4 },
  noteContainer: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    padding: 8,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#D1D5DB",
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 6,
    fontStyle: "italic",
    fontWeight: "500",
  },

  optionsContainer: { paddingLeft: 4, marginBottom: 6 },
  extraText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: 2,
  },
  exclusionText: {
    fontSize: 12,
    color: COLORS.text.muted,
    fontStyle: "italic",
  },

  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  itemPrice: { fontSize: 15, color: COLORS.text.primary, fontWeight: "800" },
  timeWrapper: { flexDirection: "row", alignItems: "center" },
  timeText: {
    fontSize: 11,
    color: COLORS.text.muted,
    marginLeft: 3,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.m,
    paddingTop: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  totalSummary: { flex: 1 },
  totalLabel: {
    fontSize: 12,
    color: COLORS.text.muted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.primary,
    marginTop: 2,
  },
  addAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  addActionText: {
    color: COLORS.white,
    fontWeight: "800",
    marginLeft: 4,
    fontSize: 14,
  },
  cancelIconButton: { marginLeft: 10, padding: 2 },
  emptyState: { paddingVertical: 20, alignItems: "center" },
  noItemsText: { color: COLORS.text.muted, fontSize: 14 },
  manageBtn: {
    padding: 4,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
