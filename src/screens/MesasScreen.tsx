import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMesas } from "../hooks/useMesas";
import MesaCard from "../components/MesaCard";
import { Mesa } from "../types/mesa";
import HomeHeader from "../components/HomeHeader";

export default function MesasScreen({ navigation }: any) {
  const { mesas, loading, refresh } = useMesas();
  const [zonaActual, setZonaActual] = useState<string>("Todas");
  const [busqueda, setBusqueda] = useState<string>("");

  const zonas = useMemo(() => {
    const lista = Array.from(new Set(mesas.map((m) => m.zona || "General")));
    return ["Todas", ...lista];
  }, [mesas]);

  const mesasFiltradas = useMemo(() => {
    return mesas.filter((m) => {
      const matchZona =
        zonaActual === "Todas" || (m.zona || "General") === zonaActual;
      const matchTexto = m.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      return matchZona && matchTexto;
    });
  }, [mesas, zonaActual, busqueda]);

  const handleOpen = (m: Mesa) => {
    navigation.navigate("Comanda", {
      mesaId: m.id,
      numeroMesa: parseInt(m.id),
      numComensales: m.ocupantes,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <HomeHeader navigation={navigation} />

      <View style={styles.headerContainer}>
        {/* Buscador */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="#9E9E9E"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Buscar mesa..."
            placeholderTextColor="#9E9E9E"
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda("")}>
              <Ionicons name="close-circle" size={18} color="#9E9E9E" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Zonas */}
      <View style={{ height: 50, marginTop: 10 }}>
        <FlatList
          data={zonas}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(z) => z}
          contentContainerStyle={styles.zonasContainer}
          renderItem={({ item }) => {
            const active = zonaActual === item;
            return (
              <TouchableOpacity
                onPress={() => setZonaActual(item)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.zonaChip, active && styles.zonaChipActive]}
                >
                  <Text
                    style={[styles.zonaText, active && styles.zonaTextActive]}
                  >
                    {item}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Grid de Mesas */}
      {loading && mesas.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FA9623" />
        </View>
      ) : (
        <FlatList
          data={mesasFiltradas}
          keyExtractor={(i) => i.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              colors={["#FA9623"]}
              tintColor="#FA9623"
            />
          }
          renderItem={({ item }) => (
            <MesaCard mesa={item} onPress={handleOpen} />
          )}
          contentContainerStyle={styles.gridContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#E0E0E0" />
              <Text style={styles.emptyText}>No se encontraron mesas.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },

  zonasContainer: { paddingHorizontal: 12, alignItems: "center" },
  zonaChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  zonaChipActive: { backgroundColor: "#FA9623", borderColor: "#FA9623" },
  zonaText: { color: "#757575", fontWeight: "600", fontSize: 13 },
  zonaTextActive: { color: "#FFF", fontWeight: "700" },

  gridContent: { paddingTop: 10, paddingHorizontal: 8, paddingBottom: 40 },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: { color: "#9E9E9E", marginTop: 10, fontSize: 16 },
});
