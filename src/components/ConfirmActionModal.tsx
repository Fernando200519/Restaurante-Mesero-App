// src/components/ConfirmActionModal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmColor?: string;
  icon?: string;
}

export const ConfirmActionModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  confirmColor = COLORS.primary,
  icon = "help-circle",
}: Props) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <View style={styles.card}>
        <View
          style={[styles.iconCircle, { backgroundColor: `${confirmColor}15` }]}
        >
          <Ionicons name={icon as any} size={32} color={confirmColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
            <Text style={styles.textCancel}>Regresar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnConfirm, { backgroundColor: confirmColor }]}
            onPress={onConfirm}
          >
            <Text style={styles.textConfirm}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  card: {
    width: "85%",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.l,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  row: { flexDirection: "row", gap: 12 },
  btnCancel: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: COLORS.surface,
  },
  textCancel: { color: COLORS.text.muted, fontWeight: "700" },
  btnConfirm: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  textConfirm: { color: COLORS.white, fontWeight: "700" },
});
