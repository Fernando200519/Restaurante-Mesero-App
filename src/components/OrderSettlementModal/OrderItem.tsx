import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/theme";

export const OrderItem = ({ det }: any) => {
  const isCancelled = det.estado === "Cancelado";
  const isPaid = det.pagado === true;

  return (
    <View
      style={[styles.itemContainer, isCancelled && styles.cancelledOpacity]}
    >
      {/* LÍNEA PRINCIPAL: CANTIDAD, PRODUCTO Y PRECIO */}
      <View style={styles.itemRow}>
        <Text style={styles.itemQty}>{det.cantidad}x</Text>
        <View style={styles.itemMainInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {det.producto}
          </Text>
          <Text style={styles.itemComensal}>Para: {det.comensal}</Text>
        </View>
        <Text style={[styles.itemPrice, isPaid && { color: "#10B981" }]}>
          {isPaid ? "PAGADO" : `$${(det.total || 0).toFixed(2)}`}
        </Text>
        <Text style={styles.itemPrice}>${(det.total || 0).toFixed(2)}</Text>
      </View>

      {/* ✅ SECCIÓN DE DETALLES: COMPLEMENTOS Y EXCLUSIONES */}
      {(det.complementos?.length > 0 || det.exclusiones?.length > 0) && (
        <View style={styles.itemDetails}>
          {/* Mapeo de Complementos con PRECIO */}
          {det.complementos?.map((c: any, idx: number) => (
            <View key={`c-${idx}`} style={styles.detailPriceRow}>
              <Text style={styles.detailText}>+ {c.nombre}</Text>
              <Text style={styles.detailPrice}>
                ${(c.precio || 0).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Mapeo de Exclusiones (Sin costo) */}
          {det.exclusiones?.map((e: string, idx: number) => (
            <Text key={`e-${idx}`} style={styles.detailText}>
              - {e}
            </Text>
          ))}
        </View>
      )}

      {/* INDICADOR DE CANCELACIÓN */}
      {isCancelled && (
        <Text style={styles.cancelledLabel}>PRODUCTO CANCELADO</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemQty: {
    width: 30,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 2,
  },
  itemMainInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  itemComensal: {
    fontSize: 11,
    color: COLORS.text.muted,
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  itemDetails: {
    paddingLeft: 30,
    marginTop: 4,
    paddingRight: 5,
  },
  detailPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  detailText: {
    fontSize: 11,
    color: COLORS.text.secondary,
    fontStyle: "italic",
    flex: 1,
  },
  detailPrice: {
    fontSize: 10,
    color: COLORS.text.muted,
    fontWeight: "600",
  },

  cancelledOpacity: {
    opacity: 0.5,
  },
  cancelledLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.error,
    marginLeft: 30,
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
