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
// 👇 Importamos el nuevo Modal
import TableOpeningModal from "../components/TableOpeningModal";
import { useAuth } from "../context/AuthContext";
import { mesasApi } from "../api/mesasApi";
import TableDetailsModal from "../components/TableDetailsModal"; // 👈 Importar

export default function MesasScreen({ navigation }: any) {
  const { token, user } = useAuth(); // Necesitamos user.id para el empleadoId
  const { mesas, loading, refresh } = useMesas();
  // 1. Iniciamos sin zona seleccionada
  const [zonaActual, setZonaActual] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");

  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  // Estados de Modales
  const [isOpeningModalVisible, setOpeningModalVisible] = useState(false); // Modal de Apertura (Verde)
  const [isDetailsModalVisible, setDetailsModalVisible] = useState(false); // Modal de Detalles (Rojo)

  // 2. Calculamos zonas SIN agregar "Todas"
  const zonas = useMemo(() => {
    // Obtenemos zonas únicas
    const lista = Array.from(new Set(mesas.map((m) => m.zona || "General")));
    return lista.sort(); // Opcional: ordenarlas alfabéticamente
  }, [mesas]);

  // 3. Efecto para seleccionar la primera zona automáticamente al cargar datos
  useEffect(() => {
    if (zonas.length > 0 && zonaActual === "") {
      setZonaActual(zonas[0]);
    }
  }, [zonas, zonaActual]);

  const mesasFiltradas = useMemo(() => {
    return mesas.filter((m) => {
      // 4. Filtro estricto: Solo mostramos la zona seleccionada
      // (Quitamos la lógica de "Todas")
      const matchZona = (m.zona || "General") === zonaActual;

      const matchTexto = m.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      return matchZona && matchTexto;
    });
  }, [mesas, zonaActual, busqueda]);

  const handlePressMesa = (m: Mesa) => {
    setSelectedMesa(m);

    if (m.estado === "ocupada") {
      // SI ESTÁ OCUPADA -> Abrimos el nuevo modal de detalles
      setDetailsModalVisible(true);
    } else {
      // SI ESTÁ LIBRE -> Abrimos el modal de apertura (comensales)
      setOpeningModalVisible(true);
    }
  };

  // Función para ir a la comanda desde el modal de detalles
  const handleNavigateToComanda = () => {
    setDetailsModalVisible(false);
    if (selectedMesa) {
      navigation.navigate("Comanda", {
        mesaId: selectedMesa.id,
        numeroMesa: parseInt(selectedMesa.id),
        numComensales: selectedMesa.ocupantes,
        orderId: selectedMesa.orderId, // ¡Importante!
      });
    }
  };

  const handleConfirmOpen = async (mesaId: number, comensales: number) => {
    // Validaciones de seguridad
    if (!token || !user || !user.id) {
      Alert.alert("Error", "No estás autenticado correctamente.");
      return;
    }

    try {
      // 1. CAPTURAR LA RESPUESTA DE LA API
      const nuevaOrden = await mesasApi.ocuparMesa(
        mesaId,
        user.id,
        comensales,
        token
      );

      // 👇 AQUÍ ESTABA EL ERROR: Usamos el nuevo nombre del estado
      setOpeningModalVisible(false);

      setSelectedMesa(null);

      // 2. USAR ESE DATO EN LA NAVEGACIÓN
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
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              colors={["#FA9623"]}
              tintColor="#FA9623"
            />
          }
          // 👇 Aquí pasamos handlePressMesa en lugar de la lógica directa
          renderItem={({ item }) => (
            <MesaCard mesa={item} onPress={handlePressMesa} />
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
