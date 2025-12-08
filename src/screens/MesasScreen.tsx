import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMesas } from "../hooks/useMesas";
import MesaCard from "../components/MesaCard";
import { Mesa } from "../types/mesa";
import HomeHeader from "../components/HomeHeader";
import TableOpeningModal from "../components/TableOpeningModal";
import { useAuth } from "../context/AuthContext";
import { mesasApi } from "../api/mesasApi";
import TableDetailsModal from "../components/TableDetailsModal";

export default function MesasScreen({ navigation }: any) {
  const { token, user } = useAuth();
  const { mesas, loading, refresh } = useMesas();
  const [zonaActual, setZonaActual] = useState<string>("Todas");
  const [busqueda, setBusqueda] = useState<string>("");
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [isOpeningModalVisible, setOpeningModalVisible] = useState(false);
  const [isDetailsModalVisible, setDetailsModalVisible] = useState(false);
  const [zonasPermitidas, setZonasPermitidas] = useState<string[]>([]);
  // 👇 1. ESTADO LOCAL PARA SABER SI ESTAMOS REFRESCANDO TODO
  const [refreshing, setRefreshing] = useState(false);
  // 👇 2. FUNCIÓN PARA CARGAR ZONAS (La sacamos del useEffect)
  const fetchZonas = async () => {
    if (token) {
      const nombres = await mesasApi.getZonasActivas(token);
      setZonasPermitidas(nombres);
    }
  };
  // 👇 3. EFECTO DE CARGA INICIAL
  useEffect(() => {
    fetchZonas();
  }, [token]);

  // 👇 4. FUNCIÓN MAESTRA DE REFRESCO (Une Mesas + Zonas)
  const onRefresh = async () => {
    setRefreshing(true); // Activamos spinner
    try {
      // Pedimos las dos cosas al mismo tiempo (Paralelo)
      await Promise.all([
        refresh(), // Recargar Mesas (del hook)
        fetchZonas(), // Recargar Zonas (nuestra función nueva)
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false); // Apagamos spinner
    }
  };

  const zonas = useMemo(() => {
    if (zonasPermitidas.length === 0) return ["Todas"];
    return ["Todas", ...zonasPermitidas.sort()];
  }, [zonasPermitidas]);

  useEffect(() => {
    if (zonas.length > 0 && zonaActual === "") {
      setZonaActual(zonas[0]);
    }
  }, [zonas, zonaActual]);

  const mesasFiltradas = useMemo(() => {
    return mesas.filter((m) => {
      const zonaDeMesa = m.zona || "General";

      const esZonaValida =
        zonasPermitidas.includes(zonaDeMesa) || zonaDeMesa === "General";

      if (!esZonaValida) return false;

      const matchZona = zonaActual === "Todas" || zonaDeMesa === zonaActual;
      const matchTexto = m.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());

      return matchZona && matchTexto;
    });
  }, [mesas, zonaActual, busqueda, zonasPermitidas]);

  const handlePressMesa = (m: Mesa) => {
    setSelectedMesa(m);

    if (m.estado === "ocupada") {
      setDetailsModalVisible(true);
    } else {
      setOpeningModalVisible(true);
    }
  };

  const handleNavigateToComanda = () => {
    setDetailsModalVisible(false);
    if (selectedMesa) {
      navigation.navigate("Comanda", {
        mesaId: selectedMesa.id,
        numeroMesa: parseInt(selectedMesa.id),
        numComensales: selectedMesa.ocupantes,
        orderId: selectedMesa.orderId,
      });
    }
  };

  const handleConfirmOpen = async (mesaId: number, comensales: number) => {
    if (!token || !user || !user.id) {
      Alert.alert("Error", "No estás autenticado correctamente.");
      return;
    }

    try {
      const nuevaOrden = await mesasApi.ocuparMesa(
        mesaId,
        user.id,
        comensales,
        token
      );

      setOpeningModalVisible(false);

      setSelectedMesa(null);

      navigation.navigate("Comanda", {
        mesaId: mesaId.toString(),
        numeroMesa: mesaId,
        numComensales: comensales,
        orderId: nuevaOrden.id || nuevaOrden.orderId,
      });

      refresh();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo abrir la mesa.");
    }
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
          // 👇 AQUÍ ESTÁ EL CAMBIO EN EL REFRESH CONTROL
          refreshControl={
            <RefreshControl
              // Usamos nuestro estado local 'refreshing' O el 'loading' inicial
              refreshing={refreshing || loading}
              // Usamos nuestra nueva función combinada
              onRefresh={onRefresh}
              colors={["#FA9623"]}
              tintColor="#FA9623"
            />
          }
          renderItem={({ item }) => (
            <MesaCard
              mesa={item}
              onPress={handlePressMesa}
              showZona={zonaActual === "Todas"}
            />
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
      {/* Modal de Apertura (Libre) */}
      <TableOpeningModal
        visible={isOpeningModalVisible}
        mesa={selectedMesa}
        onClose={() => setOpeningModalVisible(false)}
        onConfirm={handleConfirmOpen}
      />

      {/* Modal de Detalles (Ocupada) */}
      <TableDetailsModal
        visible={isDetailsModalVisible}
        mesa={selectedMesa}
        onClose={() => setDetailsModalVisible(false)}
        onManageOrder={handleNavigateToComanda}
      />
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
