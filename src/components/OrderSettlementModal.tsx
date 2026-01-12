import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const OrderSettlementModal = ({
  visible,
  orderData,
  onConfirm,
  onClose,
}: any) => {
  const [step, setStep] = useState<"ticket" | "payment">("ticket");
  const [tipo, setTipo] = useState<"Efectivo" | "Tarjeta">("Efectivo");
  const [modo, setModo] = useState<"junto" | "separado">("junto");

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setStep("ticket");
      setModo("junto");
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 200,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  if (!orderData) return null;

  const handleFinalConfirm = () => {
    onConfirm({
      modo: modo,
      tipoPago: tipo,
      propinaTotal: 0.1,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.content, { transform: [{ translateY: slideAnim }] }]}
        >
          {step === "ticket" ? (
            /* --- VISTA 1: TICKET DETALLADO (CON SCROLL INTERNO) --- */
            <View style={{ flex: 1, width: "100%" }}>
              {/* Header Fijo */}
              <View style={styles.ticketHeader}>
                <Ionicons
                  name="receipt-outline"
                  size={32}
                  color={COLORS.primary}
                />
                <Text style={styles.title}>Resumen de Cuenta</Text>
                <Text style={styles.subtitle}>
                  Mesa {orderData.mesasIds?.join(", ")} • Orden #
                  {orderData.numeroOrden}
                </Text>
              </View>

              {/* ✅ TODO el contenido informativo ahora vive dentro de este ScrollView */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
              >
                {orderData.detallesOrden?.map((det: any) => (
                  <View
                    key={det.id}
                    style={[
                      styles.itemContainer,
                      det.estado === "Cancelado" && { opacity: 0.5 },
                    ]}
                  >
                    <View style={styles.itemRow}>
                      <Text style={styles.itemQty}>{det.cantidad}x</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {det.producto}
                        </Text>
                        <Text style={styles.itemComensal}>
                          Para: {det.comensal}
                        </Text>
                      </View>
                      <Text style={styles.itemPrice}>
                        ${(det.total || 0).toFixed(2)}
                      </Text>
                    </View>

                    {(det.complementos?.length > 0 ||
                      det.exclusiones?.length > 0) && (
                      <View style={styles.itemDetails}>
                        {det.complementos?.map((c: any, idx: number) => (
                          <View
                            key={`c-${idx}`}
                            style={styles.complementPriceRow}
                          >
                            <Text style={styles.detailText}>+ {c.nombre}</Text>
                            <Text style={styles.detailPrice}>
                              ${(c.precio || 0).toFixed(2)}
                            </Text>
                          </View>
                        ))}
                        {det.exclusiones?.map((e: string, idx: number) => (
                          <Text key={`e-${idx}`} style={styles.detailText}>
                            - {e}
                          </Text>
                        ))}
                      </View>
                    )}
                    {det.estado === "Cancelado" && (
                      <Text style={styles.cancelledLabel}>
                        PRODUCTO CANCELADO
                      </Text>
                    )}
                  </View>
                ))}

                {/* Desglose por Comensal (Dentro del Scroll) */}
                {orderData.totalesPorComensal?.length > 1 && (
                  <View style={styles.guestBreakdownContainer}>
                    <View style={styles.guestHeader}>
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color={COLORS.text.muted}
                      />
                      <Text style={styles.guestHeaderText}>
                        TOTALES POR PERSONA
                      </Text>
                    </View>
                    {orderData.totalesPorComensal.map(
                      (guest: any, idx: number) => (
                        <View key={`guest-${idx}`} style={styles.guestRow}>
                          <Text style={styles.guestName}>{guest.nombre}</Text>
                          <Text style={styles.guestAmount}>
                            ${(guest.total || 0).toFixed(2)}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                )}

                <View style={styles.dividerDashed} />

                {/* Totales (Dentro del Scroll) */}
                <View style={styles.totalsContainer}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal:</Text>
                    <Text style={styles.totalVal}>
                      ${(orderData.subtotal || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>IVA (16%):</Text>
                    <Text style={styles.totalVal}>
                      $
                      {(
                        (orderData.total || 0) - (orderData.subtotal || 0)
                      ).toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.totalRow, { marginTop: 8 }]}>
                    <Text style={styles.grandTotalLabel}>TOTAL:</Text>
                    <Text style={styles.grandTotalVal}>
                      ${(orderData.total || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* ✅ Botón de Acción Fijo al pie del modal */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setStep("payment")}
              >
                <Text style={styles.primaryBtnText}>Configurar Pago</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ) : (
            /* --- VISTA 2: CONFIGURACIÓN DE PAGO (DISEÑO FIJO) --- */
            <View style={{ width: "100%", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => setStep("ticket")}
                style={styles.backBtn}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={COLORS.text.muted}
                />
                <Text style={{ color: COLORS.text.muted, marginLeft: 4 }}>
                  Revisar ticket
                </Text>
              </TouchableOpacity>

              <Text style={styles.title}>¿Cómo pagarán?</Text>
              <View style={styles.modeToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.modeOption,
                    modo === "junto" && styles.activeModeOption,
                  ]}
                  onPress={() => setModo("junto")}
                >
                  <Ionicons
                    name="people"
                    size={18}
                    color={
                      modo === "junto" ? COLORS.white : COLORS.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.modeText,
                      modo === "junto" && styles.activeModeText,
                    ]}
                  >
                    Cuenta Única
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeOption,
                    modo === "separado" && styles.activeModeOption,
                  ]}
                  onPress={() => setModo("separado")}
                >
                  <Ionicons
                    name="person"
                    size={16}
                    color={
                      modo === "separado" ? COLORS.white : COLORS.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.modeText,
                      modo === "separado" && styles.activeModeText,
                    ]}
                  >
                    Por Persona
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionLabel, { marginTop: SPACING.l }]}>
                Método de Pago
              </Text>
              <View style={styles.methodsRow}>
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    tipo === "Efectivo" && styles.activeBtn,
                  ]}
                  onPress={() => setTipo("Efectivo")}
                >
                  <Ionicons
                    name="cash-outline"
                    size={24}
                    color={
                      tipo === "Efectivo" ? COLORS.white : COLORS.text.primary
                    }
                  />
                  <Text
                    style={[
                      styles.methodLabel,
                      tipo === "Efectivo" && styles.activeText,
                    ]}
                  >
                    Efectivo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    tipo === "Tarjeta" && styles.activeBtn,
                  ]}
                  onPress={() => setTipo("Tarjeta")}
                >
                  <Ionicons
                    name="card-outline"
                    size={24}
                    color={
                      tipo === "Tarjeta" ? COLORS.white : COLORS.text.primary
                    }
                  />
                  <Text
                    style={[
                      styles.methodLabel,
                      tipo === "Tarjeta" && styles.activeText,
                    ]}
                  >
                    Tarjeta
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.finalSummary}>
                <Text style={styles.finalTotalLabel}>Monto a registrar:</Text>
                <Text style={styles.finalTotalValue}>
                  ${(orderData.total || 0).toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleFinalConfirm}
              >
                <Text style={styles.confirmText}>Finalizar y Cerrar Mesa</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancelar / Salir</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Estilos base
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: SPACING.xl,
    paddingBottom: 20,
    alignItems: "center",
    height: "90%",
  },
  ticketHeader: { alignItems: "center", marginBottom: SPACING.l },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginTop: 8,
  },
  subtitle: { fontSize: 13, color: COLORS.text.muted, fontWeight: "600" },

  itemsScroll: { width: "100%", maxHeight: 300, marginVertical: SPACING.m },
  itemContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },

  complementPriceRow: {
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

  itemDetails: {
    paddingLeft: 30,
    marginTop: 4,
    paddingRight: 10,
  },

  cancelledLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.error,
    marginLeft: 30,
    marginTop: 4,
    letterSpacing: 0.5,
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
  itemName: { fontSize: 15, fontWeight: "700", color: COLORS.text.primary },
  itemComensal: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  itemPrice: { fontWeight: "700", fontSize: 14, color: COLORS.text.primary },

  totalsContainer: { width: "100%", marginBottom: SPACING.xl },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: { color: COLORS.text.muted, fontSize: 14 },
  totalVal: { fontWeight: "600" },
  grandTotalLabel: { fontSize: 18, fontWeight: "900" },
  grandTotalVal: { fontSize: 24, fontWeight: "900", color: COLORS.primary },

  primaryBtn: {
    backgroundColor: "#000",
    width: "100%",
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },

  primaryBtnText: { color: COLORS.white, fontWeight: "800", fontSize: 16 },

  modeToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 6,
    marginTop: SPACING.m,
    width: "100%",
  },
  modeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeModeOption: { backgroundColor: COLORS.primary, elevation: 3 },
  modeText: { fontSize: 14, fontWeight: "700", color: COLORS.text.secondary },
  activeModeText: { color: COLORS.white },
  sectionLabel: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text.muted,
    marginLeft: 4,
    marginBottom: -10,
  },

  methodsRow: { flexDirection: "row", gap: 12, marginVertical: SPACING.xl },
  methodBtn: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#EEE",
    alignItems: "center",
  },
  activeBtn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  methodLabel: { marginTop: 8, fontWeight: "700" },
  activeText: { color: COLORS.white },

  finalSummary: { marginBottom: SPACING.l, alignItems: "center" },
  finalTotalLabel: { fontSize: 14, color: COLORS.text.muted },
  finalTotalValue: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text.primary,
  },

  confirmBtn: {
    backgroundColor: "#10B981",
    width: "100%",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  confirmText: { color: COLORS.white, fontWeight: "800", fontSize: 16 },
  backBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  closeBtn: { marginTop: 20 },
  closeBtnText: { color: COLORS.text.muted, fontWeight: "700" },
  guestBreakdownContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: SPACING.m,
    marginTop: SPACING.s,
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
    paddingVertical: 4,
  },
  guestName: {
    fontSize: 13,
    color: COLORS.text.primary,
    fontWeight: "600",
  },
  guestAmount: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700",
  },

  dividerDashed: {
    width: "100%",
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#DDD",
    marginVertical: 15,
  },
});
