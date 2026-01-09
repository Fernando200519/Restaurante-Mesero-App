import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";
import { COLORS, SPACING } from "../constants/theme";
import { useNotifications } from "../hooks/useNotifications";
import NotificationsModal from "./NotificationsModal";
import { NotificationItem } from "../types/notification";

export default function HomeHeader({ navigation }: { navigation: any }) {
  const { user, token, signOut, updateUserPhoto, updateUserFields } = useAuth();

  const {
    notifications,
    unreadCount,
    markRead,
    handleNotificationInteraction,
  } = useNotifications();
  const [showNotis, setShowNotis] = useState(false);

  const checkIsOnline = (estado?: string) =>
    estado === "Activo" || estado === "Disponible";

  const [isOnline, setIsOnline] = useState(checkIsOnline(user?.estado));
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [newPhone, setNewPhone] = useState(user?.telefono || "");

  useEffect(() => {
    setIsOnline(checkIsOnline(user?.estado));
    if (user?.telefono) setNewPhone(user.telefono);
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso",
        "Necesitamos acceso a tu galería para cambiar la foto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && token) {
      const selectedUri = result.assets[0].uri;
      setLocalImage(selectedUri);
      try {
        await authApi.updateUserProfile(token, { fotoUri: selectedUri });
        updateUserPhoto(selectedUri);
      } catch (error) {
        Alert.alert("Error", "No se pudo actualizar la imagen de perfil.");
        setLocalImage(null);
      }
    }
  };

  const toggleSwitch = async () => {
    const nuevoEstadoBool = !isOnline;
    const valorBackend = nuevoEstadoBool ? "Activo" : "NoDisponible";
    setIsOnline(nuevoEstadoBool);

    if (token) {
      try {
        await authApi.updateUserProfile(token, { estado: valorBackend });
        updateUserFields({ estado: valorBackend });
      } catch (error) {
        setIsOnline(!nuevoEstadoBool);
        Alert.alert("Error", "Error al cambiar disponibilidad.");
      }
    }
  };

  const savePhone = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await authApi.updateUserProfile(token, { telefono: newPhone });
      updateUserFields({ telefono: newPhone });
      setIsEditingPhone(false);
      Alert.alert("Éxito", "Perfil actualizado.");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el teléfono.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas salir del sistema?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: () => {
            signOut();
            navigation.replace("Login");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* SECCIÓN IZQUIERDA: Perfil rápido */}
      <View style={styles.leftContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMenuVisible(true)}
        >
          <Avatar
            nombre={user?.nombre || "M"}
            online={isOnline}
            avatarUrl={localImage || user?.avatarUrl}
            size={46}
          />
        </TouchableOpacity>

        {/* Agregamos un contenedor con flex para el texto */}
        <View style={styles.textContainer}>
          <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
            {user?.nombre} {user?.apellidoPaterno}
          </Text>
          <Text style={styles.roleText}>{user?.tipo || "Mesero"}</Text>
        </View>
      </View>

      {/* SECCIÓN DERECHA: Status y Salida */}
      <View style={styles.rightContainer}>
        {/* Campanita de Notificaciones */}
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => setShowNotis(true)}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={COLORS.text.primary}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "+9" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isOnline ? "#E8F5E9" : COLORS.surface },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: isOnline ? "#2E7D32" : COLORS.text.muted },
            ]}
          >
            {isOnline ? "ON" : "OFF"}
          </Text>
          <Switch
            trackColor={{ false: "#D1D1D1", true: "#C8E6C9" }}
            thumbColor={isOnline ? "#4CAF50" : "#F4F4F4"}
            onValueChange={toggleSwitch}
            value={isOnline}
            style={styles.switchStyle}
          />
        </View>

        {/* 👇 CAMBIO DE ICONO: De 'power' a 'log-out-outline' */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons
            name="log-out-outline"
            size={24}
            color={COLORS.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* MODAL DE PERFIL (DISEÑO REFINADO) */}
      <Modal
        animationType="fade"
        transparent
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          {/* Usamos un Pressable interno para evitar que el click en la tarjeta cierre el modal */}
          <Pressable
            style={styles.menuCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header del Modal con Color Institucional #FF8108 */}
            <View
              style={[styles.menuHeader, { backgroundColor: COLORS.primary }]}
            >
              <View style={styles.menuHeaderTop}>
                <View style={styles.avatarWrapper}>
                  <Avatar
                    nombre={user?.nombre || ""}
                    avatarUrl={localImage || user?.avatarUrl}
                    size={70}
                    showBadge={false}
                  />
                  <TouchableOpacity
                    style={styles.cameraBadge}
                    onPress={pickImage}
                  >
                    <Ionicons name="camera" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => setMenuVisible(false)}
                  style={styles.closeModalBtn}
                >
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <Text style={styles.menuName}>
                {user?.nombre} {user?.apellidoPaterno}
              </Text>
              <Text
                style={styles.menuEmail}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user?.correo}
              </Text>
            </View>

            <View style={styles.menuBody}>
              {/* Opción: Cambiar Password */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("ChangePassword", { canGoBack: true });
                }}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={COLORS.text.secondary}
                  />
                </View>
                <Text style={styles.menuItemTitle}>Seguridad y Contraseña</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.text.muted}
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Opción: Teléfono */}
              <View style={styles.menuItem}>
                <View style={styles.menuIconBox}>
                  <Ionicons
                    name="call-outline"
                    size={22}
                    color={COLORS.text.secondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemTitle}>Teléfono de contacto</Text>
                  {!isEditingPhone ? (
                    <Text style={styles.menuItemSubtitle}>
                      {newPhone || "No registrado"}
                    </Text>
                  ) : (
                    <TextInput
                      style={styles.phoneInput}
                      value={newPhone}
                      onChangeText={setNewPhone}
                      keyboardType="phone-pad"
                      autoFocus
                    />
                  )}
                </View>
                {isEditingPhone ? (
                  <TouchableOpacity onPress={savePhone} style={styles.saveBtn}>
                    {loading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={COLORS.white}
                      />
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setIsEditingPhone(true)}>
                    <Text style={styles.editLink}>Editar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <NotificationsModal
        visible={showNotis}
        onClose={() => setShowNotis(false)}
        notifications={notifications}
        onMarkAsRead={(item: NotificationItem) =>
          handleNotificationInteraction(item, navigation, () =>
            setShowNotis(false)
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  rightContainer: { flexDirection: "row", alignItems: "center" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 24,
    marginRight: 10,
  },
  statusText: { fontSize: 11, fontWeight: "800", marginRight: 4 },
  switchStyle: { transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] },
  logoutBtn: {
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  menuCard: {
    backgroundColor: COLORS.background,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  menuHeader: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  menuHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.m,
  },
  avatarWrapper: { position: "relative" },
  cameraBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  closeModalBtn: { padding: 4 },
  menuName: { color: COLORS.white, fontSize: 22, fontWeight: "800" },
  menuEmail: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 2 },
  menuBody: { paddingVertical: SPACING.m },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: SPACING.xl,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  menuItemSubtitle: { fontSize: 13, color: COLORS.text.muted, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: SPACING.xl,
  },
  editLink: { color: COLORS.primary, fontWeight: "700", fontSize: 14 },
  phoneInput: {
    fontSize: 16,
    color: COLORS.text.primary,
    borderBottomWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 4,
    paddingVertical: 2,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text.primary,
  },
  roleText: {
    fontSize: 12,
    color: COLORS.text.muted,
    fontWeight: "600",
    marginTop: 1,
  },

  notificationBtn: {
    marginRight: 15,
    position: "relative",
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800",
  },
});
