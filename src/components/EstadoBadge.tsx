import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 1. Definimos los tipos permitidos para evitar errores
export type EstadoMesa = "disponible" | "ocupada" | "esperando" | "agrupada";

// 2. Configuración centralizada de estilos e iconos
const CONFIG: Record<EstadoMesa | "default", { bg: string; text: string }> = {
  disponible: {
    bg: "#E8F5E9", // Verde muy suave
    text: "#2E7D32", // Verde bosque fuerte
  },
  ocupada: {
    bg: "#FFEBEE", // Rojo/Rosado muy suave
    text: "#C62828", // Rojo fuerte
  },
  esperando: {
    bg: "#FFF8E1", // Ambar suave
    text: "#F57F17", // Naranja/Ambar oscuro
  },
  agrupada: {
    bg: "#F3E5F5", // Lila suave
    text: "#7B1FA2", // Morado fuerte
  },
  default: {
    bg: "#F5F5F5",
    text: "#616161",
  },
};

interface EstadoBadgeProps {
  estado: string; // Recibimos string, pero validamos internamente
}

export default function EstadoBadge({ estado }: EstadoBadgeProps) {
  // Normalizamos el estado a minúsculas y buscamos en la config
  const key = estado.toLowerCase() as EstadoMesa;
  const theme = CONFIG[key] || CONFIG.default;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.text, { color: theme.text }]}>{estado}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start", // El badge se ajusta al contenido
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20, // Bordes completamente redondos (Pill shape)
  },
  icon: {
    marginRight: 4,
  },
  text: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800", // Extra bold para legibilidad en tamaño pequeño
    letterSpacing: 0.5,
  },
});
