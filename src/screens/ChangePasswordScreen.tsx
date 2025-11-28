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
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Input from "../components/Input";
import Button from "../components/Button";
// Asegúrate de importar tu función de API real cuando la tengas
// import { updatePasswordRequest } from "../api/authApi";

import { useAuth } from "../context/AuthContext";

interface ChangePasswordScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function ChangePasswordScreen({
  navigation,
}: ChangePasswordScreenProps) {
  // 👇 2. Extraemos también la función changePassword
  const { user, changePassword } = useAuth();
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  const isStrong = (pass: string) => {
    return pass.length >= 8 && /\d/.test(pass);
  };

  const passwordsMatch = newPass === confirmPass;
  const isValid = isStrong(newPass) && passwordsMatch && newPass.length > 0;

  const handleChangePassword = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      // 👇 3. Lógica REAL conectada a la API
      // (Eliminamos el console.log y el setTimeout)
      await changePassword(newPass);

      navigation.replace("Mesas");
    } catch (error) {
      console.error(error);
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
            <View style={styles.header}>
              <Text style={styles.title}>Configura tu contraseña</Text>
              <Text style={styles.subtitle}>
                Por seguridad, actualiza tu contraseña para continuar.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                placeholder="Nueva contraseña"
                icon="lock-closed-outline"
                secureTextEntry
                value={newPass}
                onChangeText={setNewPass}
              />

              <Input
                placeholder="Confirmar nueva contraseña"
                icon="lock-closed-outline"
                secureTextEntry
                value={confirmPass}
                onChangeText={setConfirmPass}
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
                title="Cambiar Contraseña"
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
});
