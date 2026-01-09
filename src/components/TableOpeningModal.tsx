import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Mesa } from "../types/mesa";
import { COLORS, SPACING } from "../constants/theme";

interface Props {
  visible: boolean;
  mesa: Mesa | null;
  onClose: () => void;
  onConfirm: (mesaId: number, comensales: number) => Promise<void>;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function TableOpeningModal({
  visible,
  mesa,
  onClose,
  onConfirm,
}: Props) {
  const [pax, setPax] = useState(2);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setPax(2);
      setLoading(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 150,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, mesa]);

  if (!mesa) return null;

  const isMinReached = pax <= 1;

  const handleConfirm = async () => {
    if (!mesa) return;
    setLoading(true);
    try {
      await onConfirm(mesa.id, pax);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Indicador superior de arrastre (Handle visual) */}
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="restaurant" size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.m }}>
              <Text style={styles.title}>Apertura de {mesa.nombre}</Text>
              <Text style={styles.subtitle}>{mesa.zona || "General"}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={COLORS.text.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.content}>
            <Text style={styles.label}>Número de comensales</Text>

            <View style={styles.counterRow}>
              <TouchableOpacity
                onPress={() => !isMinReached && setPax(pax - 1)}
                style={[styles.counterBtn, isMinReached && styles.btnDisabled]}
                disabled={isMinReached}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="remove"
                  size={28}
                  color={isMinReached ? COLORS.text.muted : COLORS.text.primary}
                />
              </TouchableOpacity>

              <View style={styles.paxDisplay}>
                <Text style={styles.paxNumber}>{pax}</Text>
                <Text style={styles.paxUnit}>
                  {pax === 1 ? "persona" : "personas"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setPax(pax + 1)}
                style={styles.counterBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, loading && styles.btnLoading]}
            onPress={handleConfirm}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.confirmBtnText}>Confirmar Apertura</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.white}
                  style={{ marginLeft: 8 }}
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
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)", // Fondo más oscuro para mayor enfoque en el modal
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.s,
    paddingBottom: Platform.OS === "ios" ? 40 : 30,
    width: "100%",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: SPACING.m,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: "500",
  },
  closeButton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: SPACING.s,
  },
  content: {
    alignItems: "center",
    paddingVertical: SPACING.l,
  },
  label: {
    fontSize: 15,
    color: COLORS.text.secondary,
    fontWeight: "600",
    marginBottom: SPACING.xl,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: SPACING.m,
  },
  counterBtn: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    // Sombra suave para los botones de control
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  btnDisabled: {
    backgroundColor: COLORS.surface,
    borderColor: "transparent",
    opacity: 0.5,
  },
  paxDisplay: {
    alignItems: "center",
  },
  paxNumber: {
    fontSize: 64,
    fontWeight: "900",
    color: COLORS.text.primary,
    includeFontPadding: false,
  },
  paxUnit: {
    fontSize: 14,
    color: COLORS.text.muted,
    textTransform: "uppercase",
    fontWeight: "700",
    marginTop: -5,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.m,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnLoading: {
    opacity: 0.8,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
  },
});
