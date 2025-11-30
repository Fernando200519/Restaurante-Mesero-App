import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; // 📸 1. Importar librería
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";

export default function HomeHeader({ navigation }: { navigation: any }) {
  const { user, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  const [menuVisible, setMenuVisible] = useState(false);

  // 📸 2. Estado local para mostrar la foto nueva inmediatamente (antes de subirla)
  const [localImage, setLocalImage] = useState<string | null>(null);

  const nombreMostrar = user?.nombre || "Mesero";
  const correoMostrar = user?.correo || "usuario@restaurante.com";

  // 📸 3. Función para abrir la galería
  const pickImage = async () => {
    // Pedir permisos (Expo lo maneja automático en versiones nuevas, pero por si acaso)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a tu galería para cambiar la foto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Permite recortar la imagen (cuadrada)
      aspect: [1, 1],
      quality: 0.5, // Calidad media para no saturar
    });

    if (!result.canceled) {
      setLocalImage(result.assets[0].uri);
      // AQUÍ IRÍA TU LÓGICA DE 'PATCH' MÁS ADELANTE:
      // uploadImage(result.assets[0].uri);
    }
  };

  const irACambiarPassword = () => {
    setMenuVisible(false);
    navigation.navigate("ChangePassword", { canGoBack: true });
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => {
          signOut();
          navigation.replace("Login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setMenuVisible(true)}
        >
          <Avatar
            nombre={nombreMostrar}
            online={isOnline}
            avatarUrl={user?.avatarUrl}
            size={44}
          />
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text style={styles.userName}>{nombreMostrar}</Text>
          <Text style={styles.roleText}>{user?.tipo || "Mesero"}</Text>
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

      {/* 🟢 MODAL DEL MENÚ DE PERFIL 🟢 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable style={styles.menuCard} onPress={() => {}}>
            {/* Cabecera Naranja */}
            <View style={styles.menuHeader}>
              <View style={styles.menuHeaderInfo}>
                {/* 📸 4. CONTENEDOR DEL AVATAR CON CAMARITA */}
                <View style={styles.avatarContainer}>
                  <Avatar
                    nombre={nombreMostrar}
                    // 👇 AHORA SÍ USAMOS showBadge EN FALSE
                    showBadge={false}
                    avatarUrl={localImage || user?.avatarUrl}
                    size={60}
                  />

                  {/* BOTÓN DE CÁMARA FLOTANTE */}
                  <TouchableOpacity
                    style={styles.cameraBadge}
                    onPress={pickImage}
                  >
                    <Ionicons name="camera" size={14} color="#FA9623" />
                  </TouchableOpacity>
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.menuHeaderName}>{nombreMostrar}</Text>
                  <Text style={styles.menuHeaderRole}>
                    {user?.tipo || "Mesero"}
                  </Text>
                  <Text style={styles.menuHeaderEmail}>{correoMostrar}</Text>
                </View>
              </View>
            </View>

            {/* Opciones del Menú */}
            <View style={styles.menuBody}>
              {/* Opción 1: Cambiar Contraseña */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={irACambiarPassword}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name="lock-closed-outline" size={22} color="#555" />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemTitle}>Cambiar contraseña</Text>
                  <Text style={styles.menuItemSubtitle}>
                    Actualiza tu seguridad
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Opción 2: Modo Oscuro (Dummy) */}
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemIcon}>
                  <Ionicons name="moon-outline" size={22} color="#555" />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemTitle}>Aspecto</Text>
                  <Text style={styles.menuItemSubtitle}>Modo claro</Text>
                </View>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>Próximamente</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Opción 3: Idioma (Dummy) */}
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemIcon}>
                  <Ionicons name="globe-outline" size={22} color="#555" />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemTitle}>Idioma</Text>
                  <Text style={styles.menuItemSubtitle}>Español</Text>
                </View>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>Próximamente</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  leftContainer: { flexDirection: "row", alignItems: "center" },
  textContainer: { marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  roleText: { fontSize: 12, color: "#888", marginTop: 2 },
  rightContainer: { flexDirection: "row", alignItems: "center" },
  statusSwitch: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 10, fontWeight: "bold", marginRight: 6 },
  iconButton: { padding: 8 },
  // 👇 NUEVOS ESTILOS PARA EL MENÚ MODAL 👇
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Fondo oscuro semitransparente
    justifyContent: "flex-start", // Alineado arriba
    paddingTop: 70, // Espacio para que no tape la barra de estado
    paddingHorizontal: 20,
  },
  menuCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  menuHeader: {
    backgroundColor: "#FA9623",
    padding: 20,
  },
  menuHeaderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  // 📸 ESTILOS DE LA CAMARITA
  avatarContainer: {
    position: "relative", // Necesario para que el hijo absolute se posicione respecto a esto
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: -4, // Ajusta esto para moverlo más a la derecha o izquierda
    backgroundColor: "#FFF",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FA9623", // Borde naranja para que se funda con el fondo si quieres
  },
  menuHeaderName: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  menuHeaderRole: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
  },
  menuHeaderEmail: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  menuBody: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuItemIcon: {
    width: 30,
    alignItems: "center",
    marginRight: 15,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 65,
  },
  badgeContainer: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: "#FA9623",
    fontSize: 10,
    fontWeight: "bold",
  },
});
