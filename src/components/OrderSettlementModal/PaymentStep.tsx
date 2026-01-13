import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../constants/theme";

type Props = {
  orderData: any;
  modo: "junto" | "separado";
  setModo: (value: "junto" | "separado") => void;
  tipo: "Efectivo" | "Tarjeta";
  setTipo: (value: "Efectivo" | "Tarjeta") => void;
  comensalSel: any | null;
  setComensalSel: (val: any) => void;
  montoRecibido: string;
  setMontoRecibido: (val: string) => void;
  onBack: () => void;
  onConfirm: () => void;
};

export const PaymentStep = ({
  orderData,
  modo,
  setModo,
  tipo,
  setTipo,
  comensalSel,
  setComensalSel,
  montoRecibido,
  setMontoRecibido,
  onBack,
  onConfirm,
}: Props) => {
  const montoACobrar = comensalSel ? comensalSel.total : orderData.total;
  const numRecibido = parseFloat(montoRecibido) || 0;

  // ✅ VALIDACIÓN: ¿El monto es suficiente?
  const esInsuficiente = tipo === "Efectivo" && numRecibido < montoACobrar;
  const cambio = numRecibido > montoACobrar ? numRecibido - montoACobrar : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={20} color={COLORS.text.muted} />
        <Text style={styles.backText}>Revisar ticket</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <Text style={styles.title}>Configuración de Pago</Text>

        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.modeOption,
              modo === "junto" && styles.activeModeOption,
            ]}
            onPress={() => {
              setModo("junto");
              setComensalSel(null);
            }}
          >
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

        {modo === "separado" && !comensalSel && (
          <View style={styles.guestList}>
            <Text style={styles.sectionLabel}>
              Selecciona quién va a pagar:
            </Text>
            {orderData.totalesPorComensal?.map((guest: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                style={styles.guestCard}
                onPress={() => setComensalSel(guest)}
              >
                <Text style={styles.guestName}>{guest.nombre}</Text>
                <View style={styles.row}>
                  <Text style={styles.guestTotal}>
                    ${guest.total.toFixed(2)}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {(modo === "junto" || comensalSel) && (
          <View style={styles.paymentDetails}>
            <Text style={styles.amountLabel}>Monto a cobrar:</Text>
            <Text style={styles.amountValue}>${montoACobrar.toFixed(2)}</Text>

            <Text style={styles.sectionLabel}>Método de Pago</Text>
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

              {/* ✅ TARJETA DESHABILITADA CON MENSAJE */}
              <View style={[styles.methodBtn, styles.disabledBtn]}>
                <Ionicons
                  name="card-outline"
                  size={24}
                  color={COLORS.text.muted}
                />
                <Text style={styles.disabledLabel}>Tarjeta</Text>
                <View style={styles.soonBadge}>
                  <Text style={styles.soonText}>Próximamente</Text>
                </View>
              </View>
            </View>

            {tipo === "Efectivo" && (
              <View style={styles.cashSection}>
                <View
                  style={[
                    styles.inputBox,
                    esInsuficiente && montoRecibido !== "" && styles.inputError,
                  ]}
                >
                  <Text style={styles.inputLabel}>Efectivo recibido</Text>
                  <TextInput
                    style={styles.cashInput}
                    placeholder="$ 0.00"
                    keyboardType="numeric"
                    value={montoRecibido}
                    onChangeText={setMontoRecibido}
                    placeholderTextColor="#999"
                  />
                </View>

                {/* ✅ VISUALIZACIÓN DE CAMBIO / ALERTA */}
                {numRecibido > 0 && (
                  <View style={styles.changeContainer}>
                    {esInsuficiente ? (
                      <Text style={styles.errorText}>
                        Faltan ${(montoACobrar - numRecibido).toFixed(2)}
                      </Text>
                    ) : (
                      <Text style={styles.changeText}>
                        Cambio: ${cambio.toFixed(2)}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ✅ BOTÓN DE CONFIRMACIÓN BLOQUEADO SI EL MONTO ES BAJO */}
      {(modo === "junto" || comensalSel) && (
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            esInsuficiente && styles.confirmBtnDisabled,
          ]}
          onPress={onConfirm}
          disabled={esInsuficiente || montoRecibido === ""}
        >
          <Text style={styles.confirmText}>Registrar Pago y Cerrar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%" },
  backBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backText: { color: COLORS.text.muted, marginLeft: 5, fontWeight: "600" },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  modeToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 4,
    width: "100%",
    marginBottom: 20,
  },
  modeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeModeOption: { backgroundColor: COLORS.primary },
  modeText: { fontWeight: "700", color: COLORS.text.secondary },
  activeModeText: { color: COLORS.white },
  guestList: { marginTop: 10 },
  guestCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 18,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  guestName: { fontSize: 16, fontWeight: "700", color: COLORS.text.primary },
  guestTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
    marginRight: 8,
  },
  paymentDetails: { alignItems: "center", width: "100%" },
  amountLabel: { fontSize: 14, color: COLORS.text.muted, marginBottom: 5 },
  amountValue: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  sectionLabel: {
    alignSelf: "flex-start",
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text.muted,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  methodsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  methodBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#EEE",
    alignItems: "center",
    position: "relative",
  },
  activeBtn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  methodLabel: { marginTop: 6, fontWeight: "700", fontSize: 13 },
  activeText: { color: COLORS.white },

  // Estilos Tarjeta Deshabilitada
  disabledBtn: {
    backgroundColor: "#F5F5F5",
    borderColor: "#DDD",
    opacity: 0.7,
  },
  disabledLabel: {
    marginTop: 6,
    fontWeight: "700",
    fontSize: 13,
    color: COLORS.text.muted,
  },
  soonBadge: {
    position: "absolute",
    top: -8,
    backgroundColor: "#6B7280",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  soonText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  // Input Cash
  cashSection: { width: "100%", alignItems: "center" },
  inputBox: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputError: { borderColor: COLORS.error, backgroundColor: "#FEF2F2" },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.text.muted,
    marginBottom: 4,
    textAlign: "center",
  },
  cashInput: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: COLORS.text.primary,
  },

  changeContainer: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
  },
  changeText: { fontSize: 16, fontWeight: "800", color: "#166534" },
  errorText: { fontSize: 14, fontWeight: "700", color: COLORS.error },

  confirmBtn: {
    backgroundColor: "#10B981",
    width: "100%",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  confirmBtnDisabled: { backgroundColor: "#D1D5DB" },
  confirmText: { color: COLORS.white, fontWeight: "800", fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center" },
});
