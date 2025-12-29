import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Mesa } from "../types/mesa";

const STATUS_CONFIG = {
  disponible: {
    color: "#10B981",
    bgColors: ["#ECFDF5", "#FFFFFF"],
    borderColor: "#A7F3D0",
    label: "Disponible",
  },
  ocupada: {
    color: "#EF4444",
    bgColors: ["#FEF2F2", "#FFFFFF"],
    borderColor: "#FECACA",
    label: "Ocupada",
  },
  esperando: {
    color: "#F59E0B",
    bgColors: ["#FFFBEB", "#FFFFFF"],
    borderColor: "#FDE68A",
    label: "Esperando",
  },
  agrupada: {
    color: "#8B5CF6",
    bgColors: ["#F5F3FF", "#FFFFFF"],
    borderColor: "#DDD6FE",
    label: "Agrupada",
  },
};

export default function MesaCard({
  mesa,
  onPress,
  showZona,
}: {
  mesa: Mesa;
  onPress: (m: Mesa) => void;
  showZona?: boolean;
}) {
  const config = STATUS_CONFIG[mesa.estado] || STATUS_CONFIG.disponible;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const initials = mesa.mesero?.nombre ? getInitials(mesa.mesero.nombre) : "";
  const mostrarOcupacion = mesa.estado !== "disponible";

  return (
    <TouchableOpacity
      onPress={() => onPress(mesa)}
      activeOpacity={0.9}
      style={styles.container}
    >
      <LinearGradient
        colors={config.bgColors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: config.borderColor }]}
      >
        {/* --- HEADER (Nombre, Zona, Estado) --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.tableName}>{mesa.nombre}</Text>
            {showZona && (
              <View style={styles.zonaRow}>
                <Text style={styles.zonaText}>{mesa.zona}</Text>
              </View>
            )}
          </View>

          {/* Badge de Estado (Pill) */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${config.color}15` },
            ]}
          >
            <Text style={[styles.statusText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        {/* --- OCUPACIÓN (CENTRO) --- */}
        {mostrarOcupacion ? (
          <View style={styles.ocupacionBadge}>
            <Ionicons name="people" size={16} color="#4B5563" />
            <Text style={styles.ocupantesNum}>{mesa.ocupantes}</Text>
            <Text style={styles.capacidadLabel}>personas</Text>
          </View>
        ) : (
          <View style={styles.spacer} />
        )}

        {/* --- FOOTER (Alerta y Mesero) --- */}
        <View style={styles.footer}>
          {/* Alerta de Demora */}
          <View>
            {mesa.alerta && (
              <View style={styles.alertBadge}>
                <Ionicons name="time-outline" size={12} color="#DC2626" />
                <Text style={styles.alertText}>Demora</Text>
              </View>
            )}
          </View>

          {/* Info Mesero (Solo si NO está disponible) */}
          {mesa.mesero && mostrarOcupacion && (
            <View style={styles.waiterRow}>
              <Text style={styles.waiterName}>{mesa.mesero.nombre}</Text>

              {/* CÍRCULO DEL AVATAR */}
              <View
                style={[styles.avatarContainer, { borderColor: config.color }]}
              >
                {mesa.mesero.avatarUrl ? (
                  <Image
                    source={{ uri: mesa.mesero.avatarUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.initialsContainer,
                      { backgroundColor: config.color },
                    ]}
                  >
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                )}

                {/* 👇 PUNTO DE ESTADO ACTUALIZADO */}
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: mesa.mesero.online
                        ? "#22C55E"
                        : "#9CA3AF",
                    },
                  ]}
                />
              </View>
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
    margin: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    minHeight: 145,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  tableName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  zonaRow: {
    marginTop: 2,
  },
  zonaText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  ocupacionBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    gap: 6,
  },
  ocupantesNum: {
    fontWeight: "bold",
    color: "#111827",
    fontSize: 14,
  },
  capacidadLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
  },
  spacer: {
    height: 32,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "#FEE2E2",
    borderRadius: 6,
  },
  alertText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DC2626",
  },
  waiterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  waiterName: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },

  // AVATAR
  avatarContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  initialsContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    zIndex: 10,
  },
  statusDot: {
    // Antes era onlineDot
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    // backgroundColor: "#22C55E", <-- Elimina esta línea ya que ahora es dinámica
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    zIndex: 10,
  },
});
