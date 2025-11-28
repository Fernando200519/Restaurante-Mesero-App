import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  icon: keyof typeof Ionicons.glyphMap;
}

export default function Input({ icon, secureTextEntry, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const showToggle = secureTextEntry !== undefined;

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <Ionicons
        name={icon}
        size={20}
        color={isFocused ? "#FA9623" : "#9E9E9E"}
        style={styles.icon}
      />

      <TextInput
        style={styles.input}
        placeholderTextColor="#A1A1A1"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={!isPasswordVisible}
        {...props}
      />

      {showToggle && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons
            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#9E9E9E"
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
    borderColor: "#F0F0F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    backgroundColor: "#F9F9F9",
  },
  containerFocused: {
    borderColor: "#FA9623",
    backgroundColor: "#FFF",
  },
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});
