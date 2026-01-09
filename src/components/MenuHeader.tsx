import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";

interface MenuHeaderProps {
  mesaNombre: string | number;
  comensalNombre: string;
  search: string;
  setSearch: (text: string) => void;
  onBack: () => void;
}

export default function MenuHeader({
  mesaNombre,
  comensalNombre,
  search,
  setSearch,
  onBack,
}: MenuHeaderProps) {
  return (
    <View style={styles.container}>
      {/* SECCIÓN SUPERIOR: Contexto de la Comanda */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          {/* Badge de Mesa - Color institucional #FF8108 */}
          <Text style={styles.mesaLabel}>{mesaNombre}</Text>
          <Text style={styles.comensalName} numberOfLines={1}>
            {comensalNombre || "Comensal sin nombre"}
          </Text>
        </View>

        {/* Espacio de equilibrio para el centrado del título */}
        <View style={{ width: 40 }} />
      </View>

      {/* SECCIÓN INFERIOR: Buscador Global */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={20}
            color={COLORS.text.muted}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Buscar platillo o bebida..."
            placeholderTextColor={COLORS.text.muted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.text.muted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    // Ajuste dinámico para Safe Areas
    paddingTop: Platform.OS === "ios" ? 10 : 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.m,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${COLORS.primary}10`, // Naranja translúcido
    borderRadius: 14,
  },
  titleContainer: {
    alignItems: "center",
    flex: 1,
  },
  mesaLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary, // #FF8108
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  comensalName: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text.primary,
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.m,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: SPACING.m,
    height: 50,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  searchIcon: {
    marginRight: SPACING.s,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    fontWeight: "600",
  },
  clearButton: {
    padding: 6,
  },
});
