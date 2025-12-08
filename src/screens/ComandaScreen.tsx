import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mesasApi } from "../api/mesasApi";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

interface ComensalLocal {
  id: number;
  nombre: string;
  total: number;
  itemsCount: number;
  items: any[];
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, "Comanda">;
}

export default function ComandaScreen({ navigation, route }: Props) {
  const { token } = useAuth();
  const { mesaId, numeroMesa, numComensales, orderId } = route.params as {
    mesaId: string;
    numeroMesa: number;
    numComensales: number;
    orderId: number;
  };

  const [comensales, setComensales] = useState<ComensalLocal[]>([]);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingComensalId, setEditingComensalId] = useState<number | null>(
    null
  );
  const [tempName, setTempName] = useState("");

  const calcularHaceCuanto = (fechaIso: string | null | undefined) => {
    if (!fechaIso) return "--:--";

    const fechaAjustada = fechaIso.endsWith("Z") ? fechaIso : fechaIso + "Z";
    const inicio = new Date(fechaAjustada);
    const ahora = new Date();
    const diff = ahora.getTime() - inicio.getTime();

    if (diff < 0) return "0 min";

    const minutos = Math.floor(diff / 60000);

    if (minutos < 60) return `${minutos} min`;

    const horas = Math.floor(minutos / 60);
    const minsRestantes = minutos % 60;
    return `${horas}h ${minsRestantes}m`;
  };

  useEffect(() => {
    const inicializarComensales = () => {
      if (comensales.length > 0) return;

      const nuevos: ComensalLocal[] = [];
      for (let i = 1; i <= numComensales; i++) {
        nuevos.push({
          id: i,
          nombre: `Comensal ${i}`,
          total: 0,
          itemsCount: 0,
          items: [],
        });
      }
      setComensales(nuevos);
    };

    inicializarComensales();
  }, [numComensales, comensales.length]);

  const openEditName = (id: number, currentName: string) => {
    setEditingComensalId(id);
    setTempName(currentName);
    setEditModalVisible(true);
  };

  const saveName = () => {
    if (editingComensalId !== null && tempName.trim() !== "") {
      setComensales((prev) =>
        prev.map((c) =>
          c.id === editingComensalId ? { ...c, nombre: tempName } : c
        )
      );
    }
    setEditModalVisible(false);
  };

  const handleTomarOrden = (comensal: ComensalLocal) => {
    navigation.navigate("MenuProductos", {
      comensalId: comensal.id,
      comensalNombre: comensal.nombre,
      mesaId: parseInt(mesaId),
      orderId: orderId,
    });
  };
  const renderComensal = ({ item }: { item: ComensalLocal }) => (
    <View style={styles.card}>
      {/* Header del Card (Igual que antes) */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* 👇 AHORA TODO ESTO ES BOTÓN */}
            <TouchableOpacity
              onPress={() => openEditName(item.id, item.nombre)}
              style={styles.nameClickable}
              activeOpacity={0.6}
            >
              <Text style={styles.cardName} numberOfLines={1}>
                {item.nombre}
              </Text>

              <Ionicons
                name="pencil"
                size={14}
                color="#9E9E9E"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardTotal}>${item.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* 👇 LISTA DE PRODUCTOS DEL COMENSAL */}
      <View style={styles.itemsList}>
        {item.items.length === 0 ? (
          <Text style={styles.emptyText}>Sin ordenar</Text>
        ) : (
          item.items.map((prod: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              {/* 1. Nombre */}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>1x {prod.producto}</Text>
                {/* Precio Unitario debajo del nombre */}
                <Text style={styles.itemPriceSmall}>${prod.total}.00</Text>
              </View>

              {/* 2. Estado y Tiempo (Columna derecha) */}
              <View style={{ alignItems: "flex-end" }}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {prod.estado || "Solicitado"}
                  </Text>
                </View>

                {/* Tiempo Transcurrido */}
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={12} color="#757575" />
                  <Text style={styles.timeText}>
                    Hace {calcularHaceCuanto(prod.fechaHoraInicioEstado)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Botón de Acción (Igual) */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleTomarOrden(item)}
      >
        <Ionicons
          name="add-circle-outline"
          size={18}
          color="#FFF"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.actionButtonText}>Agregar productos</Text>
      </TouchableOpacity>
    </View>
  );

  const fetchOrdenActual = async () => {
    if (!orderId || !token) return;

    try {
      const itemsBackend = await mesasApi.getDetalleOrden(orderId, token);
      const nombresRegistrados = Array.from(
        new Set(itemsBackend.map((i: any) => i.comensal))
      );
      const totalEspacios = Math.max(numComensales, nombresRegistrados.length);

      const listaFusionada: ComensalLocal[] = [];

      for (let i = 0; i < totalEspacios; i++) {
        const nombreDelBackend = nombresRegistrados[i];

        const nombreFinal = nombreDelBackend || `Comensal ${i + 1}`;

        const susItems = nombreDelBackend
          ? itemsBackend.filter(
              (item: any) => item.comensal === nombreDelBackend
            )
          : [];

        const totalDinero = susItems.reduce(
          (sum: number, item: any) => sum + (item.total || 0),
          0
        );

        listaFusionada.push({
          id: i + 1,
          nombre: nombreFinal,
          total: totalDinero,
          itemsCount: susItems.length,
          items: susItems,
        });
      }
      setComensales(listaFusionada);
    } catch (error) {
      console.log("Error cargando orden", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrdenActual();
    }, [orderId, token])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER PERSONALIZADO PARA LA ORDEN */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Mesa {numeroMesa}</Text>
          <Text style={styles.headerSubtitle}>Gestión de Comensales</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.totalMesa}>$0.00</Text>
        </View>
      </View>

      {/* LISTA DE COMENSALES */}
      <FlatList
        data={comensales}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderComensal}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* MODAL PARA EDITAR NOMBRE */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Editar Nombre</Text>
            <TextInput
              style={styles.input}
              value={tempName}
              onChangeText={setTempName}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={saveName}
              >
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  // HEADER
  header: {
    backgroundColor: "#FA9623",
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    textAlign: "center",
  },
  headerRight: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  totalMesa: {
    color: "#FFF",
    fontWeight: "bold",
  },
  // LISTA
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // CARD COMENSAL
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  nameClickable: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    maxWidth: 180,
  },

  cardStatus: {
    fontSize: 12,
    color: "#999",
  },
  cardTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  actionButton: {
    backgroundColor: "#FA9623",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  itemsList: {
    marginVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Alineado arriba para que se vea ordenado
    marginBottom: 12,
    borderBottomWidth: 0.5, // Separador sutil
    borderBottomColor: "#F0F0F0",
    paddingBottom: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  itemPriceSmall: {
    fontSize: 13,
    color: "#2E7D32", // Verde dinero
    fontWeight: "600",
    marginTop: 2,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    color: "#757575",
    marginLeft: 4,
  },
  statusBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    color: "#2196F3",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 12,
    color: "#CCC",
    fontStyle: "italic",
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#F5F5F5",
    marginRight: 10,
  },
  saveBtn: {
    backgroundColor: "#FA9623",
  },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  saveBtnText: { color: "#FFF", fontWeight: "600" },
});
