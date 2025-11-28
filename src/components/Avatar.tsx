import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface AvatarProps {
  nombre: string;
  online?: boolean;
  avatarUrl?: string | null;
  size?: number; // ✅ Nuevo: permite cambiar el tamaño fácilmente
}

export default function Avatar({
  nombre,
  online = false,
  avatarUrl,
  size = 40, // Tamaño estándar cómodo para touch
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

      {/* Indicador de Estado (Dot) */}
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize,
            backgroundColor: online ? "#4CAF50" : "#BDBDBD", // Verde éxito o Gris
            borderWidth: Math.max(2, size * 0.05), // Borde blanco proporcional
          },
        ]}
      />
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
});
