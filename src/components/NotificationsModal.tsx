// src/components/NotificationModal.tsx
import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NotificationItem } from "../types/notification";
import { calcularHaceCuanto } from "../utils/time";
import { COLORS, SPACING } from "../constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (item: NotificationItem) => void;
  onClearAllRead?: () => void;
}

export default function NotificationsModal({
  visible,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAllRead,
}: Props) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
      opacity.setValue(0);
    }
  }, [visible]);

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notiItem, !item.leido && styles.unreadItem]}
      onPress={() => onMarkAsRead(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, item.leido && styles.iconCircleRead]}>
        <Ionicons
          name="restaurant"
          size={18}
          color={item.leido ? COLORS.text.muted : COLORS.primary}
        />
      </View>
      <View style={styles.content}>
        <Text
          style={[
            styles.message,
            !item.leido && styles.boldText,
            item.leido && styles.readText,
          ]}
        >
          {item.mensaje}
        </Text>
        <Text style={styles.time}>{calcularHaceCuanto(item.fechaHora)}</Text>
      </View>
      {!item.leido && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.fullScreen}>
        {/* 🌑 Fondo con Opacidad Animada */}
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <Pressable style={styles.flex1} onPress={onClose} />
        </Animated.View>

        {/* 💳 Tarjeta con Deslizamiento Animado */}
        <Animated.View
          style={[styles.sheetContainer, { transform: [{ translateY }] }]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Notificaciones</Text>
              <Text style={styles.subtitle}>
                {notifications.filter((n) => !n.leido).length} pendientes
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.text.muted} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons
                  name="notifications-off-outline"
                  size={48}
                  color="#E5E7EB"
                />
                <Text style={styles.emptyText}>No hay avisos por ahora</Text>
              </View>
            }
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, justifyContent: "flex-end" },
  flex1: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheetContainer: {
    width: "100%",
    height: "75%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 20,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: SPACING.l,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.text.muted,
    fontWeight: "600",
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
  },
  list: { paddingHorizontal: SPACING.l, paddingBottom: 40 },
  notiItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  unreadItem: {
    backgroundColor: `${COLORS.primary}05`,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginHorizontal: -12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleRead: { backgroundColor: "#F3F4F6" },
  content: { flex: 1, marginLeft: 14 },
  message: {
    fontSize: 15,
    color: COLORS.text.primary,
    lineHeight: 20,
    fontWeight: "500",
  },
  boldText: { fontWeight: "800", color: "#000000" },
  readText: { color: COLORS.text.muted, opacity: 0.8 },
  time: {
    fontSize: 12,
    color: COLORS.text.muted,
    marginTop: 4,
    fontWeight: "600",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  empty: { alignItems: "center", marginTop: 80 },
  emptyText: {
    color: COLORS.text.muted,
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
});
