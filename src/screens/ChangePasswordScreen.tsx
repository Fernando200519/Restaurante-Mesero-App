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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

interface ChangePasswordScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: any;
}

export default function ChangePasswordScreen({
  navigation,
  route,
}: ChangePasswordScreenProps) {
  const { changePassword } = useAuth();

  // Si canGoBack es true, significa que es un cambio VOLUNTARIO (desde el menú)
  // Si es false, es el cambio OBLIGATORIO (primer login)
  const canGoBack = route.params?.canGoBack || false;

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  // 👇 DEFINIMOS LOS TEXTOS SEGÚN EL CONTEXTO
  const screenTitle = canGoBack
    ? "Cambiar Contraseña"
    : "Configura tu contraseña";
  const screenSubtitle = canGoBack
    ? "Ingresa tu contraseña actual y define una nueva para actualizar tu seguridad."
    : "Por seguridad, actualiza tu contraseña para continuar.";

  const isStrong = (pass: string) => {
    return pass.length >= 8 && /\d/.test(pass);
  };

  const passwordsMatch = newPass === confirmPass;
  const isValid =
    currentPass.length > 0 &&
    isStrong(newPass) &&
    passwordsMatch &&
    newPass.length > 0;

  const handleChangePassword = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      await changePassword(currentPass, newPass, confirmPass);

      Alert.alert("Éxito", "Contraseña actualizada correctamente", [
        {
          text: "OK",
          onPress: () => {
            // 👇 LÓGICA DE NAVEGACIÓN MEJORADA
            if (canGoBack) {
              navigation.goBack(); // Si vino del menú, regresa al menú
            } else {
              navigation.replace("Mesas"); // Si es login forzoso, entra al sistema
            }
          },
        },
      ]);
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Error",
        error.message || "La contraseña actual es incorrecta o hubo un error."
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
          <View style={styles.innerContainer}>
            {/* BOTÓN DE ATRÁS CONDICIONAL */}
            {canGoBack && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={28} color="#333" />
              </TouchableOpacity>
            )}

            <View style={styles.header}>
              {/* 👇 USAMOS LAS VARIABLES DINÁMICAS */}
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
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                placeholder="Nueva contraseña"
                icon="lock-closed-outline"
                secureTextEntry
                value={newPass}
                onChangeText={setNewPass}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                placeholder="Confirmar nueva contraseña"
                icon="lock-closed-outline"
                secureTextEntry
                value={confirmPass}
                onChangeText={setConfirmPass}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.validationContainer}>
                {newPass.length > 0 && !isStrong(newPass) && (
                  <Text style={styles.warningText}>
                    Mínimo 8 caracteres y un número.
                  </Text>
                )}

                {confirmPass.length > 0 && !passwordsMatch && (
                  <Text style={styles.warningText}>
                    Las contraseñas no coinciden.
                  </Text>
                )}
              </View>

              <Button
                title={canGoBack ? "Actualizar" : "Comenzar"} // También cambiamos el botón un poco
                onPress={handleChangePassword}
                isLoading={loading}
                style={!isValid ? styles.btnDisabled : undefined}
              />

              {!isValid && <View style={styles.overlayDisable} />}
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
    marginBottom: 30,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#757575",
    textAlign: "center",
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  form: {
    width: "100%",
  },
  validationContainer: {
    marginBottom: 10,
    minHeight: 20,
  },
  warningText: {
    color: "#FF3B30",
    fontSize: 13,
    marginBottom: 5,
    fontWeight: "500",
    marginLeft: 4,
  },
  btnDisabled: {
    backgroundColor: "#E0E0E0",
    shadowOpacity: 0,
    elevation: 0,
  },
  overlayDisable: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: "transparent",
  },
  // Estilo para el botón de atrás
  backButton: {
    position: "absolute",
    top: 20, // Ajusta según tu gusto
    left: 0,
    zIndex: 10,
    padding: 10,
  },
});
