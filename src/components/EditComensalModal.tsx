import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS, SPACING } from "../constants/theme";

export const EditComensalModal = ({
  visible,
  value,
  onChange,
  onSave,
  onClose,
}: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <Pressable style={styles.overlay} onPress={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.modalTitle}>Identificar Comensal</Text>
          <Text style={styles.modalSubtitle}>
            Asigna un nombre o referencia para este cliente.
          </Text>

          <TextInput
            value={value}
            onChangeText={onChange}
            style={styles.input}
            placeholder="Ej. Cliente 1, Juan, etc."
            autoFocus
            placeholderTextColor={COLORS.text.muted}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.btn, styles.btnCancel]}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSave}
              style={[
                styles.btn,
                styles.btnSave,
                { backgroundColor: COLORS.primary },
              ]}
            >
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: { width: "100%", alignItems: "center" },
  modalContent: {
    backgroundColor: COLORS.white,
    width: "85%",
    borderRadius: 24,
    padding: SPACING.xl,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SPACING.l,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: SPACING.xl,
  },
  buttonRow: { flexDirection: "row", gap: 12 },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  // 👇 AGREGA ESTA LÍNEA PARA ELIMINAR EL ERROR
  btnSave: {
    // Puede estar vacío porque el color lo pasamos por props,
    // pero debe existir para que TypeScript no se queje.
  },
  btnCancel: { backgroundColor: COLORS.surface },
  cancelText: { color: COLORS.text.secondary, fontWeight: "700" },
  saveText: { color: COLORS.white, fontWeight: "700" },
});
