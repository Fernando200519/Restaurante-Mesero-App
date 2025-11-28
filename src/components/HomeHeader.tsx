import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";

export default function HomeHeader({ navigation }: { navigation: any }) {
  // 👇 CAMBIO 1: Usamos 'signOut' que es como se llama en el Contexto
  const { user, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  const nombreMostrar = user?.nombre || "Mesero";

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => {
          // 👇 CAMBIO 2: Llamamos a la función correcta
          signOut();
          // Dependiendo de cómo tengas tu navegación en App.tsx:
          // Si tu navegación verifica "user ? App : Login", el signOut solo ya te sacaría.
          // Si no, esta línea está bien para forzar la ida al Login.
          navigation.replace("Login"); // 👈 Debe coincidir con el name="" de App.tsx
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {/* Avatar un poco más grande para lucir mejor */}
        <Avatar
          nombre={nombreMostrar}
          online={isOnline}
          avatarUrl={user?.avatarUrl}
          size={44}
        />
        <View style={styles.textContainer}>
          {/* Eliminado "Mesa Libre". Ahora el nombre es el protagonista */}
          <Text style={styles.userName}>{nombreMostrar}</Text>
          <Text style={styles.roleText}>Mesero</Text>
        </View>
      </View>

      <View style={styles.rightContainer}>
        <View style={styles.statusSwitch}>
          <Text
            style={[
              styles.statusText,
              { color: isOnline ? "#4CAF50" : "#9E9E9E" },
            ]}
          >
            {isOnline ? "ON" : "OFF"}
          </Text>
          <Switch
            trackColor={{ false: "#E0E0E0", true: "#DFF6E3" }}
            thumbColor={isOnline ? "#4CAF50" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setIsOnline(!isOnline)}
            value={isOnline}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
          <Ionicons name="log-out-outline" size={24} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12, // Reduje un poco el padding vertical
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    justifyContent: "center",
  },
  userName: {
    fontSize: 18, // Más grande
    fontWeight: "800", // Más negrita
    color: "#212121",
    letterSpacing: -0.5,
  },
  roleText: {
    fontSize: 13,
    color: "#FA9623", // Naranja marca para el rol
    fontWeight: "600",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  statusSwitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  iconButton: {
    padding: 4,
  },
});
