import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Text,
  StatusBar,
  Alert,
} from "react-native";
import { COLORS, SPACING } from "../../constants/theme";
import { TicketStep } from "./TicketStep";
import { PaymentStep } from "./PaymentStep";

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

  const [comensalSel, setComensalSel] = useState<any | null>(null);
  const [montoRecibido, setMontoRecibido] = useState("");

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setStep("ticket");
      setModo("junto");
      setComensalSel(null);
      setMontoRecibido("");
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
    const idsAPagar =
      modo === "junto"
        ? orderData.detallesOrden
            .filter((d: any) => !d.pagado && d.estado !== "Cancelado")
            .map((d: any) => d.id)
        : orderData.detallesOrden
            .filter(
              (d: any) =>
                d.comensal === comensalSel?.nombre &&
                !d.pagado &&
                d.estado !== "Cancelado"
            )
            .map((d: any) => d.id);

    if (idsAPagar.length === 0) {
      Alert.alert("Aviso", "Este comensal ya no tiene deudas pendientes.");
      return;
    }

    onConfirm({
      modo,
      tipoPago: tipo,
      montoPagado: parseFloat(montoRecibido) || 0,
      detallesIds: idsAPagar,
      propina: 0,
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
          {/* ✅ INDICADOR DE ARRASTRE (UX IMPROVEMENT) */}
          <View style={styles.dragHandle} />

          <View style={styles.stepContainer}>
            {step === "ticket" ? (
              <TicketStep
                orderData={orderData}
                onNext={() => setStep("payment")}
              />
            ) : (
              <PaymentStep
                orderData={orderData}
                modo={modo}
                setModo={setModo}
                tipo={tipo}
                setTipo={setTipo}
                comensalSel={comensalSel}
                setComensalSel={setComensalSel}
                montoRecibido={montoRecibido}
                setMontoRecibido={setMontoRecibido}
                onBack={() => setStep("ticket")}
                onConfirm={handleFinalConfirm}
              />
            )}
          </View>

          {/* BOTÓN DE SALIDA CON DISEÑO MÁS LIMPIO */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cerrar y volver a la mesa</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.xl + (StatusBar.currentHeight || 0),
    alignItems: "center",
    height: "92%",
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginBottom: SPACING.l,
  },
  stepContainer: {
    flex: 1,
    width: "100%",
  },
  closeBtn: {
    marginTop: SPACING.m,
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  closeBtnText: {
    color: COLORS.text.muted,
    fontWeight: "700",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
