import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import Input from "../components/Input";
import Button from "../components/Button";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<any>;
}
export default function LoginScreen({ navigation }: LoginScreenProps) {
  // En tu input dice "Usuario", pero para la API es el correo
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();

  const handleLogin = async () => {
    // 1. Validaciones básicas antes de enviar
    if (!usuario || !password) {
      setError("Por favor ingresa usuario y contraseña");
      return;
    }

    setLoading(true); // Activamos carga
    setError(null); // Limpiamos errores previos
    try {
      const result = await signIn(usuario, password);

      if (result.success) {
        if (result.requirePasswordChange) {
          // CORRECCIÓN 1: En App.tsx se llama "ChangePassword"
          navigation.replace("ChangePassword");
        } else {
          // CORRECCIÓN 2: En App.tsx se llama "Mesas"
          navigation.replace("Mesas");
        }
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      // ✅ PON ESTO:
      console.log(err); // Esto solo lo ves tú en la terminal, el usuario no ve nada feo
      setError("Ocurrió un error inesperado");
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
        >
          <View style={styles.innerContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Mesa Libre</Text>
            </View>

            <View style={styles.form}>
              <Input
                placeholder="Usuario"
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

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Button
                title="Iniciar Sesión"
                onPress={handleLogin}
                isLoading={loading}
              />
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
    backgroundColor: "#FAFAFA",
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: "#FA9623",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#FA9623",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  logoText: {
    color: "white",
    fontSize: 40,
    fontWeight: "800",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  form: {
    width: "100%",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 5,
    textAlign: "center",
    fontWeight: "600",
  },
});
