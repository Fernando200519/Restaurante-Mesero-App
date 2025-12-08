import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // 👈 Importante
import { Mesa } from "../types/mesa";

// Configuración de colores basada en tu prototipo (Tailwind traducido a Hex)
const STATUS_CONFIG = {
  disponible: {
    color: "#10B981", // emerald-500
    bgColors: ["#ECFDF5", "#FFFFFF"], // from-emerald-50 to-white
    borderColor: "#A7F3D0", // border-emerald-200
    label: "Disponible",
  },
  ocupada: {
    color: "#EF4444", // red-500
    bgColors: ["#FEF2F2", "#FFFFFF"], // from-red-50 to-white
    borderColor: "#FECACA", // border-red-200
    label: "Ocupada",
  },
  esperando: {
    color: "#F59E0B", // amber-500
    bgColors: ["#FFFBEB", "#FFFFFF"], // from-amber-50 to-white
    borderColor: "#FDE68A", // border-amber-200
    label: "Esperando",
  },
  agrupada: {
    color: "#8B5CF6", // violet-500
    bgColors: ["#F5F3FF", "#FFFFFF"], // from-violet-50 to-white
    borderColor: "#DDD6FE", // border-violet-200
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
  const isFull = mesa.ocupantes >= mesa.capacidad;

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
        {/* --- HEADER --- */}
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

        {/* --- OCUPACIÓN --- */}
        <View
          style={[
            styles.ocupacionBadge,
            isFull ? styles.ocupacionFull : styles.ocupacionNormal,
          ]}
        >
          <Ionicons
            name="people"
            size={16}
            color={isFull ? "#DC2626" : "#4B5563"}
          />
          <Text style={styles.ocupantesNum}>{mesa.ocupantes}</Text>
          {/* Mantenemos tu petición anterior de ocultar la capacidad total visualmente si prefieres */}
          {/* <Text style={styles.capacidadNum}>/ {mesa.capacidad}</Text> */}
          <Text style={styles.capacidadLabel}>personas</Text>
        </View>

        {/* --- FOOTER --- */}
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

          {/* Info Mesero */}
          {mesa.mesero && mesa.estado !== "disponible" && (
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
                  // Si son iniciales, necesitamos un fondo de color
                  <View
                    style={[
                      styles.initialsContainer,
                      { backgroundColor: config.color },
                    ]}
                  >
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                )}

                {/* EL PUNTO ONLINE (Ahora vive fuera de cualquier recorte) */}
                {mesa.mesero.online && <View style={styles.onlineDot} />}
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
    // Sombra del contenedor
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    borderRadius: 16, // rounded-2xl
    padding: 16,
    borderWidth: 2, // border-2
    minHeight: 140,
    justifyContent: "space-between",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tableName: {
    fontSize: 20, // text-xl
    fontWeight: "bold",
    color: "#111827", // gray-900
  },
  zonaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  zonaText: {
    fontSize: 12, // text-xs
    color: "#6B7280", // gray-500
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999, // rounded-full
  },
  statusText: {
    fontSize: 11, // text-xs
    fontWeight: "600",
  },

  // Ocupación
  ocupacionBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12, // rounded-xl
    gap: 6,
  },
  ocupacionNormal: {
    backgroundColor: "#F3F4F6", // bg-gray-100
  },
  ocupacionFull: {
    backgroundColor: "#FEE2E2", // bg-red-100
  },
  ocupantesNum: {
    fontWeight: "bold",
    color: "#111827", // gray-900
    fontSize: 15,
  },
  capacidadLabel: {
    color: "#6B7280",
    fontSize: 13,
  },
  capacidadNum: {
    // Por si decides volver a poner "/ 8"
    color: "#6B7280", // text-gray-500
    fontSize: 14,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6", // border-gray-100
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FEE2E2", // bg-red-100
    borderColor: "#FECACA", // border-red-200
    borderWidth: 1,
    borderRadius: 8,
  },
  alertText: {
    fontSize: 11, // text-xs
    fontWeight: "600",
    color: "#DC2626", // text-red-600
  },

  // Waiter & Avatar
  waiterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  waiterName: {
    fontSize: 12, // text-xs
    color: "#4B5563", // text-gray-600
  },

  // AJUSTES DEL AVATAR 👇
  avatarContainer: {
    width: 44, // 1. Aumentamos tamaño (antes 36)
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    // Quitamos overflow: hidden para que el punto pueda sobresalir si quiere
    position: "relative",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 22, // 2. Redondeamos la imagen DIRECTAMENTE
    borderWidth: 2, // Opcional: Borde blanco para separar
    borderColor: "#FFF",
  },

  initialsContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },

  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  onlineDot: {
    position: "absolute",
    bottom: 0, // 3. Lo pegamos bien a la esquina
    right: 0,
    width: 14, // Un poco más grande para que se note
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E", // Verde brillante
    borderWidth: 2.5, // Borde blanco grueso para que resalte sobre la foto
    borderColor: "#FFFFFF",
    zIndex: 10, // 4. Aseguramos que esté ENCIMA de todo
  },
});
