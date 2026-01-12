// src/components/Avatar.tsx

import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

interface AvatarProps {
  nombre: string;
  online?: boolean;
  avatarUrl?: string | null;
  size?: number;
  showBadge?: boolean;
  inverted?: boolean; // ✅ Nueva prop para cambiar colores en fondos oscuros
}

export default function Avatar({
  nombre,
  online = false,
  avatarUrl,
  size = 40,
  showBadge = true,
  inverted = false, // Por defecto falso
}: AvatarProps) {
  // ✅ Lógica de iniciales mejorada (evita errores si el nombre tiene espacios extra)
  const cleanName = nombre?.trim() || "";
  const initials =
    cleanName.length > 0
      ? cleanName
          .split(/\s+/)
          .map((n) => n[0])
          .filter((n) => !!n)
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "?";

  const borderRadius = size / 2;
  const fontSize = size * 0.38; // Ajuste leve para mejor estética

  // ✅ Verificación estricta de imagen
  const hasValidImage =
    typeof avatarUrl === "string" && avatarUrl.trim().length > 0;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {hasValidImage ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.image, { width: size, height: size, borderRadius }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius,
              backgroundColor: inverted
                ? "rgba(255,255,255,0.2)"
                : `${COLORS.primary}15`,
              borderColor: inverted ? COLORS.white : `${COLORS.primary}30`,
            },
          ]}
        >
          <Text
            style={[
              styles.text,
              {
                fontSize,
                color: inverted ? COLORS.white : COLORS.primary,
              },
            ]}
          >
            {initials}
          </Text>
        </View>
      )}

      {showBadge && (
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: online ? "#22C55E" : "#BDBDBD",
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: (size * 0.28) / 2,
              borderWidth: Math.max(2, size * 0.05),
              borderColor: COLORS.white,
            },
          ]}
        />
      )}
    </View>
  );
}

// ... (los estilos se quedan igual)
const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    // Eliminamos sombras pesadas para que el círculo se vea más limpio
  },
  image: {
    backgroundColor: COLORS.surface,
  },
  fallback: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  text: {
    fontWeight: "800",
    textAlign: "center",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    elevation: 2,
  },
});
