import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Mesa } from "../types/mesa";
import EstadoBadge from "./EstadoBadge";
import Avatar from "./Avatar";

// Mismos colores (Sin cambios)
const STATUS_COLORS: Record<string, string> = {
  disponible: "#4CAF50",
  ocupada: "#EF5350",
  esperando: "#FF9800",
  agrupada: "#9C27B0",
};

export default function MesaCard({
  mesa,
  onPress,
}: {
  mesa: Mesa;
  onPress: (m: Mesa) => void;
}) {
  const accentColor = STATUS_COLORS[mesa.estado] ?? "#BDBDBD";
  const isFull = mesa.ocupantes >= mesa.capacidad;
  const showAvatar = mesa.mesero && mesa.estado !== "disponible";

  return (
    <TouchableOpacity
      onPress={() => onPress(mesa)}
      activeOpacity={0.7}
      // Aplicamos el borde de color aquí
      style={[styles.card, { borderColor: accentColor }]}
    >
      <View style={styles.header}>
        <Text style={styles.tableName}>{mesa.nombre}</Text>
        <EstadoBadge estado={mesa.estado} />
      </View>

      <View style={styles.body}>
        <View style={styles.statContainer}>
          <Ionicons
            name="people"
            size={16}
            color={isFull ? "#D32F2F" : "#757575"}
          />
          <Text style={styles.ocupacionText}>
            <Text style={styles.ocupantesNum}>{mesa.ocupantes}</Text>
            <Text style={styles.capacidadNum}>/{mesa.capacidad}</Text>
          </Text>
        </View>
        <Text style={styles.zonaText}>{mesa.zona || "General"}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.alertContainer}>
          {mesa.alerta ? (
            <View style={styles.alertBadge}>
              <Ionicons name="time" size={14} color="#D32F2F" />
              <Text style={styles.alertText}>Demora</Text>
            </View>
          ) : (
            <View style={{ height: 24 }} />
          )}
        </View>

        {showAvatar && (
          <View style={styles.waiterContainer}>
            <Avatar
              nombre={mesa.mesero?.nombre || "Mesero"}
              online={mesa.mesero?.online}
              avatarUrl={mesa.mesero?.avatarUrl}
              size={40}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16, // Aumenté un poco el radio para esquinas más suaves
    margin: 6,
    padding: 12,

    // 👇 EL SECRETO ESTÁ AQUÍ:
    borderWidth: 1.2, // Mucho más fino (antes era por defecto o muy grueso)
    // borderColor se define en línea dinámicamente

    // Sombras más sutiles para que no peleen con el borde
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, // Sombra más corta
    shadowOpacity: 0.04, // Muy sutil
    shadowRadius: 3,
    elevation: 2, // Elevación baja en Android para evitar bordes pixelados

    minHeight: 120,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tableName: { fontSize: 17, fontWeight: "bold", color: "#212121" },
  body: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ocupacionText: { marginLeft: 6, fontSize: 14 },
  ocupantesNum: { fontWeight: "bold", color: "#212121", fontSize: 16 },
  capacidadNum: { color: "#9E9E9E", fontWeight: "500" },
  zonaText: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "500",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto",
  },
  alertContainer: { flex: 1, alignItems: "flex-start" },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  alertText: {
    color: "#D32F2F",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },

  waiterContainer: {
    marginLeft: 8,
  },
});
