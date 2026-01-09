import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  TextInputProps,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";

interface InputProps extends TextInputProps {
  icon: keyof typeof Ionicons.glyphMap;
}

export default function Input({ icon, secureTextEntry, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const showToggle = secureTextEntry !== undefined;

  return (
    <View
      style={[
        styles.container,
        isFocused && {
          borderColor: COLORS.primary,
          backgroundColor: COLORS.white,
          borderWidth: 2,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={isFocused ? COLORS.primary : COLORS.text.muted}
        style={styles.icon}
      />

      <TextInput
        style={styles.input}
        placeholderTextColor={COLORS.text.muted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        selectionColor={COLORS.primary}
        {...props}
      />

      {showToggle && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          activeOpacity={0.6}
          style={styles.toggle}
        >
          <Ionicons
            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={COLORS.text.muted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F1F1F1",
    borderRadius: 18,
    paddingHorizontal: SPACING.m,
    height: 58,
    marginBottom: SPACING.m,
    backgroundColor: COLORS.surface,
  },
  icon: {
    marginRight: SPACING.s,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: "500",
  },
  toggle: {
    padding: SPACING.xs,
  },
});
