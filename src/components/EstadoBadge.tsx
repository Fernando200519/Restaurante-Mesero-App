// 1. React y Hooks
import React from "react";

// 2. Librerías Externas (UI e Iconos)
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 3. Recursos Locales (Arquitectura Limpia)
import { COLORS, SPACING } from "../constants/theme";

export type EstadoMesa = "disponible" | "ocupada" | "esperando" | "agrupada";

const CONFIG: Record<
  EstadoMesa | "default",
  {
    bg: string;
    text: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }
> = {
  disponible: {
    bg: "#ECFDF5",
    text: "#059669",
    icon: "checkmark-circle",
    label: "Libre",
  },
  ocupada: {
    bg: "#FEF2F2",
    text: "#DC2626",
    icon: "restaurant",
    label: "Ocupada",
  },
  esperando: {
    bg: `${COLORS.primary}15`,
    text: COLORS.primary,
    icon: "time",
    label: "Atención",
  },
  agrupada: {
    bg: "#F5F3FF",
    text: "#7C3AED",
    icon: "layers",
    label: "Unida",
  },
  default: {
    bg: COLORS.surface,
    text: COLORS.text.muted,
    icon: "help-circle",
    label: "Estado",
  },
};

interface EstadoBadgeProps {
  estado: string;
}

export default function EstadoBadge({ estado }: EstadoBadgeProps) {
  const key = estado.toLowerCase() as EstadoMesa;
  const theme = CONFIG[key] || CONFIG.default;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Ionicons
        name={theme.icon}
        size={14}
        color={theme.text}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: theme.text }]}>
        {theme.label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.s + 2,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  icon: {
    marginRight: 6,
  },
  text: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
});
