import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

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
  size = 40, // Tamaño estándar cómodo para touch
  showBadge = true,
}: AvatarProps) {
  // Generación de iniciales segura
  const initials = nombre
    ? nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  // Cálculos dinámicos basados en el tamaño
  const borderRadius = size / 2;
  const fontSize = size * 0.4;
  const dotSize = size * 0.28; // El punto es aprox el 28% del avatar

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.base, { width: size, height: size, borderRadius }]}
        />
      ) : (
        <View
          style={[
            styles.base,
            styles.fallback,
            { width: size, height: size, borderRadius },
          ]}
        >
          <Text style={[styles.text, { fontSize }]}>{initials}</Text>
        </View>
      )}

      {/* 👇 AQUÍ ESTABA EL ERROR:
         Antes tenías un <View> aquí sin condición. Lo he borrado.
         Solo dejamos este bloque que verifica "showBadge":
      */}

      {showBadge && (
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: online ? "#4CAF50" : "#BDBDBD",
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              // Ajustamos el borde dinámicamente según el tamaño
              borderWidth: Math.max(2, size * 0.05),
              borderColor: "#FFFFFF",
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5", // Fondo base por si la imagen es transparente
  },
  fallback: {
    backgroundColor: "#FFF3E0", // Fondo naranja muy suave
    borderWidth: 1,
    borderColor: "#FFE0B2", // Borde sutil
  },
  text: {
    fontWeight: "700",
    color: "#EF6C00", // Naranja oscuro para contraste
  },
  dot: {
    position: "absolute",
    right: -2, // Un poco salido para que no tape la cara
    bottom: -2,
    borderColor: "#FFFFFF",
    zIndex: 1, // Asegura que flote encima
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#FFFFFF", // Borde blanco para que se separe de la foto
  },
});
