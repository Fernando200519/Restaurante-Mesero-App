import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import { StatusBar } from "expo-status-bar";

import { useMesas } from "../hooks/useMesas";
import MesaCard from "../components/MesaCard";
import { Mesa } from "../types/mesa";
import HomeHeader from "../components/HomeHeader";
import TableOpeningModal from "../components/TableOpeningModal";
import { mesasApi } from "../api/mesasApi";
import TableDetailsModal from "../components/TableDetailsModal";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { COLORS, SPACING } from "../constants/theme";

export default function MesasScreen({ navigation }: any) {
  const { token, user, signOut, refreshSession } = useAuth();
  const { mesas, loading, refresh } = useMesas();

  const [zonaActual, setZonaActual] = useState<string>("Todas");
  const [busqueda, setBusqueda] = useState<string>("");
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [isOpeningModalVisible, setOpeningModalVisible] = useState(false);
  const [isDetailsModalVisible, setDetailsModalVisible] = useState(false);
  const [zonasPermitidas, setZonasPermitidas] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchZonas = async () => {
    if (token) {
      try {
        const data = await mesasApi.getZonasActivas(token);

        const nombres = data
          .filter((z: any) => z.nombre.toLowerCase() !== "sin zona")
          .map((z: any) => z.nombre);

        setZonasPermitidas(nombres);
      } catch (error) {
        console.log("Error al cargar zonas");
      }
    }
  };

  useEffect(() => {
    fetchZonas();
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const performUpdate = async () => {
        if (!isActive || !token) return;
        try {
          await refresh(true);
          await fetchZonas();
        } catch (error: any) {
          if (error.message.includes("Sesión expirada")) {
            const newToken = await refreshSession();
            if (newToken && isActive) {
              await refresh(true, newToken);
            } else if (!newToken) {
              handleSessionExpired();
            }
          }
        }
      };

      const handleSessionExpired = () => {
        isActive = false;
        signOut();
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        Alert.alert(
          "Seguridad",
          "Tu sesión ha expirado. Por favor, ingresa de nuevo."
        );
      };

      performUpdate();
      const intervalId = setInterval(performUpdate, 5000);

      return () => {
        isActive = false;
        clearInterval(intervalId);
      };
    }, [refresh, token, signOut, refreshSession, navigation])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refresh(false), fetchZonas()]);
    } finally {
      setRefreshing(false);
    }
  };

  const zonas = useMemo(
    () => ["Mis Mesas", "Todas", ...zonasPermitidas.sort()],
    [zonasPermitidas]
  );

  const mesasFiltradas = useMemo(() => {
    return mesas
      .filter((m) => {
        if (zonaActual === "Mis Mesas") {
          return m.meseroId === user?.id && m.estado !== "disponible";
        }

        const zonaDeMesa = m.zona || "General";
        const matchZona = zonaActual === "Todas" || zonaDeMesa === zonaActual;
        const matchTexto = m.nombre
          .toLowerCase()
          .includes(busqueda.toLowerCase());

        return matchZona && matchTexto;
      })
      .sort((a, b) => a.id - b.id);
  }, [mesas, zonaActual, busqueda, user?.id]);

  const handleConfirmOpen = async (mesaId: number, comensales: number) => {
    if (!token) {
      Alert.alert("Sesión no válida", "Por favor, ingresa de nuevo.");
      return;
    }

    try {
      const nuevaOrden = await mesasApi.ocuparMesa(mesaId, comensales, token);

      setOpeningModalVisible(false);
      setSelectedMesa(null);

      navigation.navigate("Comanda", {
        mesaId: mesaId.toString(),
        mesaNombre: selectedMesa?.nombre || mesaId.toString(),
        numComensales: comensales,
        orderId: nuevaOrden.id,
      });

      await refresh();
    } catch (error: any) {
      console.error("Error al abrir mesa:", error);
      Alert.alert("Error de Sistema", "No se pudo abrir la mesa.");
    }
  };

  const handleNavigateToComanda = () => {
    setDetailsModalVisible(false);
    if (selectedMesa) {
      navigation.navigate("Comanda", {
        mesaId: selectedMesa.id.toString(),
        mesaNombre: selectedMesa.nombre,
        numComensales: selectedMesa.comensales,
        orderId: selectedMesa.ordenId,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <HomeHeader navigation={navigation} />

      {/* Sección de Búsqueda y Filtros */}
      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.text.muted} />
          <TextInput
            placeholder="Buscar por número o nombre..."
            placeholderTextColor={COLORS.text.muted}
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.text.muted}
              />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={zonas}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) =>
            typeof item === "string" ? item : `zone-${index}`
          }
          contentContainerStyle={styles.zonasScroll}
          renderItem={({ item }) => {
            const active = zonaActual === item;
            const isPersonalZone = item === "Mis Mesas";

            return (
              <TouchableOpacity
                onPress={() => setZonaActual(item)}
                activeOpacity={0.8}
                style={[
                  styles.zonaChip,
                  active && styles.zonaChipActive,
                  isPersonalZone && !active && { borderColor: COLORS.primary },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {isPersonalZone && (
                    <Ionicons
                      name="star"
                      size={14}
                      color={active ? COLORS.white : COLORS.primary}
                      style={{ marginRight: 6 }}
                    />
                  )}
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

      {/* Listado de Mesas */}
      {loading && mesas.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando plano de mesas...</Text>
        </View>
      ) : (
        <FlatList
          data={mesasFiltradas}
          keyExtractor={(i) => i.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <MesaCard
              mesa={item}
              onPress={(m) => {
                setSelectedMesa(m);
                if (m.estado !== "disponible") {
                  setDetailsModalVisible(true);
                } else {
                  setOpeningModalVisible(true);
                }
              }}
              showZona={zonaActual === "Todas"}
              currentUserId={user?.id}
            />
          )}
          contentContainerStyle={styles.gridContent}
          // En el ListEmptyComponent de la FlatList
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={
                  zonaActual === "Mis Mesas"
                    ? "cafe-outline"
                    : "restaurant-outline"
                }
                size={64}
                color="#E0E0E0"
              />
              <Text style={styles.emptyText}>
                {zonaActual === "Mis Mesas"
                  ? "¡Todo al día! No tienes mesas activas en este momento."
                  : "No hay mesas disponibles en esta zona."}
              </Text>
            </View>
          }
        />
      )}

      {/* Modales de Gestión */}
      <TableOpeningModal
        visible={isOpeningModalVisible}
        mesa={selectedMesa}
        onClose={() => setOpeningModalVisible(false)}
        onConfirm={handleConfirmOpen}
      />
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
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterSection: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: SPACING.m,
    paddingHorizontal: SPACING.m,
    height: 48,
    marginBottom: SPACING.s,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    marginLeft: SPACING.s,
  },
  zonasScroll: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.xs,
  },
  zonaChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: SPACING.s,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  zonaChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  zonaText: {
    color: COLORS.text.secondary,
    fontWeight: "600",
    fontSize: 13,
  },
  zonaTextActive: {
    color: COLORS.white,
    fontWeight: "700",
  },
  gridContent: {
    paddingTop: SPACING.s,
    paddingHorizontal: SPACING.s,
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: SPACING.m,
    color: COLORS.text.muted,
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyText: {
    color: COLORS.text.muted,
    marginTop: SPACING.m,
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: SPACING.xxl,
  },
});
