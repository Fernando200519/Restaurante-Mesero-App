import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Input from "../components/Input";
import Button from "../components/Button";
import { authApi } from "../api/authApi";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.includes("@")) {
      Alert.alert("Error", "Ingresa un correo válido");
      return;
    }

    setLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      Alert.alert(
        "Correo enviado",
        "Revisa tu bandeja de entrada para restablecer tu contraseña.",
        [{ text: "Volver al Login", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo enviar la solicitud. Verifica el correo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.text}>
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu acceso.
        </Text>

        <Input
          placeholder="Correo electrónico"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Button
          title="Enviar enlace"
          onPress={handleSend}
          isLoading={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
  backBtn: { marginBottom: 20 },
  content: { flex: 1, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 10,
  },
  text: { fontSize: 15, color: "#757575", marginBottom: 30, lineHeight: 22 },
});
