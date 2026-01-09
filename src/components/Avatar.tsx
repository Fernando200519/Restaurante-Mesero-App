// 1. React y Hooks
import React from "react";

// 2. Librerías Externas (UI)
import { View, Text, Image, StyleSheet } from "react-native";

// 3. Recursos Locales (Arquitectura Limpia)
import { COLORS } from "../constants/theme";

interface AvatarProps {
  nombre: string;
  online?: boolean;
  avatarUrl?: string | null;
  size?: number;
  showBadge?: boolean;
}

export default function Avatar({
  nombre,
  online = false,
  avatarUrl,
  size = 40,
  showBadge = true,
}: AvatarProps) {
  const initials = nombre
    ? nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const borderRadius = size / 2;
  const fontSize = size * 0.4;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {avatarUrl ? (
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
              backgroundColor: `${COLORS.primary}15`,
              borderColor: `${COLORS.primary}30`,
            },
          ]}
        >
          <Text style={[styles.text, { fontSize, color: COLORS.primary }]}>
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

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    elevation: 2,
  },
});
