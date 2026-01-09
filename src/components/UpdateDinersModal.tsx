// 1. React y Hooks
import React, { useState, useEffect } from "react";

// 2. Librerías Externas
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 3. Recursos Locales (Arquitectura Limpia)
import { COLORS, SPACING } from "../constants/theme";

interface UpdateDinersModalProps {
  visible: boolean;
  currentDiners: number;
  onClose: () => void;
  onSave: (newCount: number) => void;
}

export const UpdateDinersModal = ({
  visible,
  currentDiners,
  onClose,
  onSave,
}: UpdateDinersModalProps) => {
  const [count, setCount] = useState(currentDiners);

  // Sincronizar el estado local cuando se abre el modal
  useEffect(() => {
    if (visible) setCount(currentDiners);
  }, [visible, currentDiners]);

  const handleIncrement = () => setCount((prev) => prev + 1);
  const handleDecrement = () => setCount((prev) => Math.max(1, prev - 1));

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Comensales en Mesa</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.text.muted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Ajusta el número total de personas físicamente en la mesa.
          </Text>

          {/* Selector de cantidad profesional */}
          <View style={styles.selectorContainer}>
            <TouchableOpacity
              onPress={handleDecrement}
              style={styles.qtyBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={32} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={styles.countWrapper}>
              <Text style={styles.countText}>{count}</Text>
              <Text style={styles.countLabel}>Personas</Text>
            </View>

            <TouchableOpacity
              onPress={handleIncrement}
              style={styles.qtyBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={32} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSave(count)}
              style={styles.saveBtn}
            >
              <Text style={styles.saveText}>Actualizar Mesa</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.l,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.xl,
    width: "100%",
    maxWidth: 340,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.s,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text.primary,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.muted,
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  selectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.m,
    marginBottom: SPACING.xl,
  },
  qtyBtn: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  countWrapper: {
    alignItems: "center",
  },
  countText: {
    fontSize: 42,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  countLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.text.muted,
    fontWeight: "700",
    fontSize: 16,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  saveText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 16,
  },
});
