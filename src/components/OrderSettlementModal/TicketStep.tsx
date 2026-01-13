import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../constants/theme";

export const TicketStep = ({ orderData, onNext }: any) => {
  return (
    <View style={styles.container}>
      {/* HEADER FIJO */}
      <View style={styles.ticketHeader}>
        <Ionicons name="receipt-outline" size={32} color={COLORS.primary} />
        <Text style={styles.title}>Resumen de Cuenta</Text>
        <Text style={styles.subtitle}>
          Mesa {orderData.mesasIds?.join(", ")} • Orden #{orderData.numeroOrden}
        </Text>
      </View>

      {/* CONTENIDO DESLIZABLE */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        {orderData.detallesOrden?.map((det: any) => (
          <View
            key={det.id}
            style={[
              styles.itemContainer,
              det.estado === "Cancelado" && styles.cancelledOpacity,
            ]}
          >
            <View style={styles.itemRow}>
              <Text style={styles.itemQty}>{det.cantidad}x</Text>
              <View style={styles.itemMainInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {det.producto}
                </Text>
                <Text style={styles.itemComensal}>Para: {det.comensal}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${(det.total || 0).toFixed(2)}
              </Text>
            </View>

            {/* COMPLEMENTOS Y EXCLUSIONES */}
            {(det.complementos?.length > 0 || det.exclusiones?.length > 0) && (
              <View style={styles.itemDetails}>
                {det.complementos?.map((c: any, idx: number) => (
                  <View key={`c-${idx}`} style={styles.detailPriceRow}>
                    <Text style={styles.detailText}>+ {c.nombre}</Text>
                    <Text style={styles.detailPrice}>
                      ${(c.precio || 0).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {det.estado === "Cancelado" && (
              <Text style={styles.cancelledLabel}>PRODUCTO CANCELADO</Text>
            )}
          </View>
        ))}

        {/* DESGLOSE POR PERSONA (Si hay más de uno) */}
        {orderData.totalesPorComensal?.length > 1 && (
          <View style={styles.guestBreakdown}>
            <View style={styles.guestHeader}>
              <Ionicons
                name="people-outline"
                size={14}
                color={COLORS.text.muted}
              />
              <Text style={styles.guestHeaderText}>TOTALES POR PERSONA</Text>
            </View>
            {orderData.totalesPorComensal.map((guest: any, idx: number) => (
              <View key={`g-${idx}`} style={styles.guestRow}>
                <Text style={styles.guestName}>{guest.nombre}</Text>
                <Text style={styles.guestAmount}>
                  ${(guest.total || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.dividerDashed} />

        {/* RESUMEN DE TOTALES */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              ${(orderData.subtotal || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (16%):</Text>
            <Text style={styles.totalValue}>
              ${((orderData.total || 0) - (orderData.subtotal || 0)).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 10 }]}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>
              ${(orderData.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* BOTÓN FIJO AL PIE */}
      <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
        <Text style={styles.primaryBtnText}>Configurar Pago</Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%" },
  ticketHeader: { alignItems: "center", marginBottom: SPACING.m },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginTop: 4,
  },
  subtitle: { fontSize: 13, color: COLORS.text.muted, fontWeight: "600" },
  scrollArea: { flex: 1, marginBottom: 10 },

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
  itemMainInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: "700", color: COLORS.text.primary },
  itemComensal: { fontSize: 11, color: COLORS.text.muted, marginTop: 1 },
  itemPrice: { fontSize: 14, fontWeight: "700", color: COLORS.text.primary },

  itemDetails: { paddingLeft: 30, marginTop: 4, paddingRight: 5 },
  detailPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  detailText: {
    fontSize: 11,
    color: COLORS.text.secondary,
    fontStyle: "italic",
    flex: 1,
  },
  detailPrice: { fontSize: 10, color: COLORS.text.muted, fontWeight: "600" },

  cancelledOpacity: { opacity: 0.5 },
  cancelledLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.error,
    marginLeft: 30,
    marginTop: 4,
    letterSpacing: 0.5,
  },

  guestBreakdown: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#F1F3F5",
  },
  guestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  guestHeaderText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.text.muted,
    letterSpacing: 1,
  },
  guestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  guestName: { fontSize: 13, color: COLORS.text.primary, fontWeight: "600" },
  guestAmount: { fontSize: 13, color: COLORS.primary, fontWeight: "700" },

  dividerDashed: {
    width: "100%",
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#DDD",
    marginVertical: 15,
  },
  totalsSection: { paddingHorizontal: 5 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: { fontSize: 14, color: COLORS.text.muted },
  totalValue: { fontSize: 14, fontWeight: "600", color: COLORS.text.primary },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  grandTotalValue: { fontSize: 24, fontWeight: "900", color: COLORS.primary },

  primaryBtn: {
    backgroundColor: "#000",
    width: "100%",
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: "800", fontSize: 16 },
});
