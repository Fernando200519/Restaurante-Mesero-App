import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import Input from "../components/Input";
import Button from "../components/Button";
import { authApi } from "../api/authApi";
import { COLORS, SPACING } from "../constants/theme";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert(
        "Formato Inválido",
        "Por favor, ingresa un correo electrónico corporativo válido."
      );
      return;
    }

    setLoading(true);
    try {
      await authApi.requestPasswordReset(email.trim());
      Alert.alert(
        "Solicitud Enviada",
        "Si el correo está registrado en Mesa Libre, recibirás un enlace de recuperación en unos minutos.",
        [{ text: "Entendido", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        "Error de Conexión",
        "No pudimos procesar tu solicitud. Verifica tu conexión a internet o intenta más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Botón Volver - Estilo consistente con ComandaScreen */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            {/* Elemento Visual de Marca */}
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={40} color={COLORS.primary} />
            </View>

            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
              No te preocupes. Ingresa tu correo y te ayudaremos a recuperar tu
              acceso al sistema de comandas.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="Correo electrónico"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={styles.buttonWrapper}>
              <Button
                title="Enviar enlace de acceso"
                onPress={handleSend}
                isLoading={loading}
              />
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.cancelLink}
            >
              <Text style={styles.cancelText}>Cancelar y volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.l,
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: SPACING.s,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: SPACING.m,
  },
  form: {
    flex: 1,
    marginTop: SPACING.m,
  },
  buttonWrapper: {
    marginTop: SPACING.m,
  },
  cancelLink: {
    marginTop: SPACING.l,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.text.muted,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
