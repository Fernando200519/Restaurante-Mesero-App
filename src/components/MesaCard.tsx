import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Mesa } from "../types/mesa";
import { COLORS, SPACING } from "../constants/theme";

const STATUS_CONFIG = {
  disponible: {
    color: "#10B981",
    bgColors: ["#F0FDF4", "#FFFFFF"] as [string, string],
    borderColor: "#DCFCE7",
    label: "Libre",
  },
  ocupada: {
    color: "#EF4444",
    bgColors: ["#FEF2F2", "#FFFFFF"] as [string, string],
    borderColor: "#FEE2E2",
    label: "Ocupada",
  },
  esperando: {
    color: "#F59E0B",
    bgColors: ["#FFFBEB", "#FFFFFF"] as [string, string],
    borderColor: "#FEF3C7",
    label: "Por Cobrar",
  },
  agrupada: {
    color: "#8B5CF6",
    bgColors: ["#F5F3FF", "#FFFFFF"] as [string, string],
    borderColor: "#EDE9FE",
    label: "Unida",
  },
  liberar: {
    color: "#3B82F6",
    bgColors: ["#EFF6FF", "#FFFFFF"] as [string, string],
    borderColor: "#DBEAFE",
    label: "Por Liberar",
  },
};

interface MesaCardProps {
  mesa: Mesa;
  onPress: (m: Mesa) => void;
  showZona?: boolean;
  currentUserId?: number;
}

export default function MesaCard({
  mesa,
  onPress,
  showZona,
  currentUserId,
}: MesaCardProps) {
  const config =
    STATUS_CONFIG[mesa.estado as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.disponible;

  const isOccupied =
    mesa.estado === "ocupada" ||
    mesa.estado === "esperando" ||
    mesa.estado === "liberar";

  const isMyTable = isOccupied && mesa.meseroId === currentUserId;

  const initials = useMemo(() => {
    if (!mesa.nombreMesero) return "";
    return mesa.nombreMesero
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [mesa.nombreMesero]);

  return (
    <TouchableOpacity
      onPress={() => onPress(mesa)}
      activeOpacity={0.9}
      style={styles.container}
    >
      <LinearGradient
        colors={config.bgColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          { borderColor: config.borderColor },
          { borderWidth: 1.5 },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.titleWrapper}>
            <Text style={styles.tableName}>{mesa.nombre}</Text>
            {showZona && <Text style={styles.zonaText}>{mesa.zona}</Text>}
          </View>

          <View
            style={[
              styles.statusPill,
              { backgroundColor: `${config.color}15` },
            ]}
          >
            <Text style={[styles.statusLabel, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {isOccupied ? (
            <View style={styles.occupancyRow}>
              <Ionicons
                name="people-outline"
                size={16}
                color={COLORS.text.secondary}
              />
              <Text style={styles.occupancyText}>
                <Text style={styles.boldText}>{mesa.comensales}</Text> personas
              </Text>
            </View>
          ) : (
            <Text style={styles.availableText}>Lista para servicio</Text>
          )}
        </View>

        <View style={styles.footer}>
          {mesa.nombreMesero && isOccupied ? (
            <View style={styles.waiterInfo}>
              <View style={styles.avatarWrapper}>
                {mesa.fotoPerfilMesero ? (
                  <Image
                    source={{ uri: mesa.fotoPerfilMesero }}
                    style={styles.avatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.initialsCircle,
                      {
                        backgroundColor: isMyTable ? "#000000" : "#E5E7EB",
                      },
                    ]}
                  >
                    <Text style={styles.initialsText}>{initials}</Text>
                  </View>
                )}
                {/* ✅ INDICADOR DINÁMICO */}
                <View
                  style={[
                    styles.onlineIndicator,
                    {
                      backgroundColor: mesa.meseroDisponible
                        ? "#22C55E"
                        : "#9CA3AF",
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.waiterName,
                  isMyTable && { color: "#000000", fontWeight: "900" },
                ]}
                numberOfLines={1}
              >
                {isMyTable
                  ? "Tú"
                  : mesa.nombreMesero?.split(" ").slice(0, 2).join(" ") ||
                    "Mesero"}
              </Text>
            </View>
          ) : (
            <View style={{ height: 28 }} />
          )}

          {isMyTable && (
            <View style={styles.miniBadgeBlack}>
              <Text style={styles.miniBadgeTextWhite}>MÍA</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  card: {
    borderRadius: 18,
    padding: SPACING.m,
    minHeight: 155,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleWrapper: { flex: 1 },
  tableName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  zonaText: {
    fontSize: 12,
    color: COLORS.text.muted,
    fontWeight: "600",
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  body: { marginVertical: SPACING.s },
  occupancyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  occupancyText: { fontSize: 14, color: COLORS.text.secondary },
  boldText: { fontWeight: "800", color: COLORS.text.primary },
  availableText: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "600",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.03)",
  },
  waiterInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatarWrapper: { position: "relative" },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  initialsCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: { color: COLORS.white, fontSize: 10, fontWeight: "bold" },
  onlineIndicator: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  waiterName: { fontSize: 12, color: COLORS.text.secondary },
  miniBadgeBlack: {
    backgroundColor: "#000000",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniBadgeTextWhite: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
});
