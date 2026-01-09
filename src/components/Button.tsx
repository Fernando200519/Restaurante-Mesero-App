import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING } from "../constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "primary" | "outline";
}

export default function Button({
  title,
  onPress,
  isLoading = false,
  style,
  textStyle,
  variant = "primary",
}: ButtonProps) {
  const isOutline = variant === "outline";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isLoading}
      style={[styles.wrapper, style]}
    >
      <LinearGradient
        colors={
          isOutline ? [COLORS.white, COLORS.white] : [COLORS.primary, "#FF9D42"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.btn,
          isOutline && styles.btnOutline,
          isLoading && styles.btnDisabled,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator
            color={isOutline ? COLORS.primary : COLORS.white}
          />
        ) : (
          <Text
            style={[
              styles.text,
              isOutline && { color: COLORS.primary },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginTop: SPACING.m,
  },
  btn: {
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  text: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
