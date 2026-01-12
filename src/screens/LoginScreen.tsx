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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { COLORS, SPACING } from "../constants/theme";

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!usuario || !password) {
      setError("Por favor ingresa credenciales válidas");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await signIn(usuario, password);

      if (result.success) {
        navigation.replace(
          result.requirePasswordChange ? "ChangePassword" : "Mesas"
        );
      } else {
        setError("Las credenciales no coinciden con nuestros registros");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.innerContainer}>
            {/* ✅ Cabecera actualizada con Logo */}
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Image
                  source={require("../../assets/mesa-blanca.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Mesa Libre</Text>
            </View>

            {/* Formulario limpio y enfocado */}
            <View style={styles.form}>
              <Input
                placeholder="Correo electrónico o usuario"
                icon="person-outline"
                value={usuario}
                onChangeText={(text) => {
                  setUsuario(text);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
              />

              <Input
                placeholder="Contraseña"
                icon="lock-closed-outline"
                value={password}
                secureTextEntry
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(null);
                }}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.buttonSpacer}>
                <Button
                  title="Iniciar Sesión"
                  onPress={handleLogin}
                  isLoading={loading}
                />
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                style={styles.forgotButton}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  logoBox: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.m,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: "800",
  },
  logoImage: {
    width: "70%",
    height: "70%",
    tintColor: "#FFFFFF",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  form: {
    width: "100%",
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}10`,
    padding: SPACING.s,
    borderRadius: 8,
    marginVertical: SPACING.s,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
  buttonSpacer: {
    marginTop: SPACING.m,
  },
  forgotButton: {
    alignSelf: "center",
    marginTop: SPACING.xl,
    padding: SPACING.s,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
