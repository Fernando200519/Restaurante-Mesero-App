import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { COLORS, SPACING } from "../constants/theme";

interface ChangePasswordScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: any;
}

export default function ChangePasswordScreen({
  navigation,
  route,
}: ChangePasswordScreenProps) {
  const { changePassword } = useAuth();
  const canGoBack = route.params?.canGoBack || false;

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  // Textos dinámicos basados en el flujo de usuario
  const screenTitle = canGoBack ? "Seguridad" : "Nueva Contraseña";
  const screenSubtitle = canGoBack
    ? "Actualiza tu clave de acceso periódicamente para proteger tu cuenta."
    : "Tu cuenta está inactiva. Por seguridad, crea una contraseña nueva.";

  const isStrong = (pass: string) => pass.length >= 8 && /\d/.test(pass);
  const passwordsMatch = newPass === confirmPass;

  const isValid = currentPass.length > 0 && isStrong(newPass) && passwordsMatch;

  const handleChangePassword = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      await changePassword(currentPass, newPass, confirmPass);

      Alert.alert("Éxito", "Contraseña actualizada correctamente", [
        {
          text: "Entendido",
          onPress: () => {
            if (canGoBack) {
              navigation.goBack();
            } else {
              navigation.replace("Mesas");
            }
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error de Seguridad",
        error.message || "La contraseña actual no es válida."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Cabecera con Botón de Regreso Profesional */}
            <View style={styles.topBar}>
              {canGoBack && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="chevron-back"
                    size={28}
                    color={COLORS.text.primary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="shield-checkmark"
                  size={40}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.title}>{screenTitle}</Text>
              <Text style={styles.subtitle}>{screenSubtitle}</Text>
            </View>

            <View style={styles.form}>
              <Input
                placeholder="Contraseña actual"
                icon="key-outline"
                secureTextEntry
                value={currentPass}
                onChangeText={setCurrentPass}
              />

              <Input
                placeholder="Nueva contraseña"
                icon="lock-closed-outline"
                secureTextEntry
                value={newPass}
                onChangeText={setNewPass}
              />

              <Input
                placeholder="Confirmar nueva contraseña"
                icon="checkmark-circle-outline"
                secureTextEntry
                value={confirmPass}
                onChangeText={setConfirmPass}
              />

              {/* Indicadores de Validación Dinámicos */}
              <View style={styles.validationBox}>
                <ValidationItem
                  text="Mínimo 8 caracteres y un número"
                  isValid={isStrong(newPass)}
                  show={newPass.length > 0}
                />
                <ValidationItem
                  text="Las contraseñas coinciden"
                  isValid={passwordsMatch}
                  show={confirmPass.length > 0}
                />
              </View>

              <Button
                title={canGoBack ? "Actualizar Seguridad" : "Activar Cuenta"}
                onPress={handleChangePassword}
                isLoading={loading}
                style={!isValid ? styles.btnDisabled : undefined}
                variant={!isValid ? "outline" : "primary"}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

// Componente auxiliar para una arquitectura limpia
const ValidationItem = ({
  text,
  isValid,
  show,
}: {
  text: string;
  isValid: boolean;
  show: boolean;
}) => {
  if (!show) return null;
  return (
    <View style={styles.validationItem}>
      <Ionicons
        name={isValid ? "checkmark-circle" : "close-circle"}
        size={16}
        color={isValid ? "#22C55E" : COLORS.error}
      />
      <Text
        style={[
          styles.validationText,
          { color: isValid ? "#15803D" : COLORS.error },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  topBar: {
    height: 60,
    justifyContent: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginTop: SPACING.m,
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginTop: SPACING.s,
    lineHeight: 24,
  },
  form: {
    width: "100%",
  },
  validationBox: {
    marginBottom: SPACING.m,
    gap: SPACING.xs,
  },
  validationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 8,
  },
  validationText: {
    fontSize: 13,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
