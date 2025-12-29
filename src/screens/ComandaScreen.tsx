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
  const { mesaId, numeroMesa, orderId } = route.params as {
    mesaId: string;
    numeroMesa: number;
    numComensales: number;
    orderId: number;
  };

  const [comensales, setComensales] = useState<ComensalLocal[]>([
    {
      id: 1,
      nombre: "Comensal 1",
      total: 0,
      itemsCount: 0,
      items: [],
    },
  ]);
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

  const fetchOrdenActual = async () => {
    if (!orderId || !token) return;

    try {
      const itemsBackend = await mesasApi.getDetalleOrden(orderId, token);

      setComensales((prevComensales) => {
        let listaFinal: ComensalLocal[] = [];

        // CASO 1: Carga Inicial (Estado local vacío)
        if (prevComensales.length === 0) {
          const nombresRegistrados = Array.from(
            new Set(itemsBackend.map((i: any) => i.comensal))
          );

          if (nombresRegistrados.length === 0) {
            // Si backend vacío -> Creamos Comensal 1
            listaFinal = [
              {
                id: 1,
                nombre: "Comensal 1",
                total: 0,
                itemsCount: 0,
                items: [],
              },
            ];
          } else {
            // Si backend trae gente -> Los creamos
            nombresRegistrados.forEach((nombre: any, index) => {
              const susItems = itemsBackend.filter(
                (i: any) => i.comensal === nombre
              );
              const total = susItems.reduce(
                (sum: number, i: any) => sum + (i.total || 0),
                0
              );

              listaFinal.push({
                id: index + 1,
                nombre: nombre || `Comensal ${index + 1}`,
                total,
                itemsCount: susItems.length,
                items: susItems,
              });
            });
          }
        }
        // CASO 2: Fusión (Ya tenemos datos locales editados)
        else {
          listaFinal = prevComensales.map((local) => {
            const susItems = itemsBackend.filter(
              (i: any) => i.comensal === local.nombre
            );
            const total = susItems.reduce(
              (sum: number, i: any) => sum + (i.total || 0),
              0
            );
            return {
              ...local,
              items: susItems,
              itemsCount: susItems.length,
              total: total,
            };
          });

          // Agregar nuevos del backend si faltan (Sincronización multi-mesero)
          const nombresLocales = new Set(listaFinal.map((c) => c.nombre));
          const nombresBackend = Array.from(
            new Set(itemsBackend.map((i: any) => i.comensal))
          );

          nombresBackend.forEach((nombreBack: any) => {
            if (nombreBack && !nombresLocales.has(nombreBack)) {
              const susItems = itemsBackend.filter(
                (i: any) => i.comensal === nombreBack
              );
              const total = susItems.reduce(
                (sum: number, i: any) => sum + (i.total || 0),
                0
              );

              listaFinal.push({
                id: Date.now() + Math.random(), // ID temporal único
                nombre: nombreBack,
                total,
                itemsCount: susItems.length,
                items: susItems,
              });
            }
          });
        }

        // 👇 LA RED DE SEGURIDAD FINAL (Esto faltaba o fallaba):
        // Si después de toda la lógica la lista quedó vacía (ej. borraste todo y recargaste),
        // forzamos la creación del Comensal 1.
        if (listaFinal.length === 0) {
          return [
            {
              id: 1,
              nombre: "Comensal 1",
              total: 0,
              itemsCount: 0,
              items: [],
            },
          ];
        }

        return listaFinal;
      });
    } catch (error) {
      console.log("Error cargando orden", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrdenActual();
    }, [orderId, token])
  );

  const agregarComensal = () => {
    setComensales((prev) => [
      ...prev,
      {
        id: Date.now(),
        nombre: `Comensal ${prev.length + 1}`,
        total: 0,
        itemsCount: 0,
        items: [],
      },
    ]);
  };

  const eliminarComensal = (id: number) => {
    const comensal = comensales.find((c) => c.id === id);
    if (comensal && comensal.items.length > 0) {
      Alert.alert(
        "No se puede eliminar",
        "Este comensal ya tiene productos ordenados."
      );
      return;
    }

    if (comensales.length <= 1) {
      Alert.alert("Aviso", "Debe haber al menos un comensal.");
      return;
    }

    Alert.alert("Eliminar", "¿Borrar este espacio?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => setComensales((prev) => prev.filter((c) => c.id !== id)),
      },
    ]);
  };

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
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {/* Nombre Editable */}
            <TouchableOpacity
              onPress={() => openEditName(item.id, item.nombre)}
              style={styles.nameClickable}
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

            {/* 👇 BOTÓN ELIMINAR (Solo si no tiene items) */}
            {item.items.length === 0 && (
              <TouchableOpacity
                onPress={() => eliminarComensal(item.id)}
                style={{ padding: 4 }}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.cardTotal}>${item.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Lista de productos (Igual que antes) */}
      <View style={styles.itemsList}>
        {item.items.length === 0 ? (
          <Text style={styles.emptyText}>Sin ordenar</Text>
        ) : (
          item.items.map((prod: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              {/* ... (tu renderizado de items igual) ... */}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>1x {prod.producto}</Text>
                <Text style={styles.itemPriceSmall}>${prod.total}.00</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {prod.estado || "Solicitado"}
                  </Text>
                </View>
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

  // 👇 NUEVO: INTERCEPTOR DE SALIDA
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // 1. Analizamos si hay cambios locales "en riesgo"
      // Buscamos comensales que NO tengan productos ordenados (items.length === 0)
      const comensalesVacios = comensales.filter((c) => c.items.length === 0);

      // Si no hay vacíos, todo está guardado en backend. Dejamos salir.
      if (comensalesVacios.length === 0) {
        return;
      }

      // 2. Filtramos el caso "Default": Si solo hay 1 comensal, está vacío y se llama "Comensal 1",
      // no nos importa, es una pantalla limpia. Dejamos salir.
      const esPantallaLimpia =
        comensales.length === 1 &&
        comensales[0].items.length === 0 &&
        comensales[0].nombre === "Comensal 1";

      if (esPantallaLimpia) {
        return;
      }

      // 3. Si llegamos aquí, es porque hay datos locales (ej. "Pedro" vacío, o 3 comensales vacíos)
      // Prevenimos la navegación
      e.preventDefault();

      // Obtenemos los nombres de los que se van a perder para el mensaje
      const nombresEnRiesgo = comensalesVacios.map((c) => c.nombre).join(", ");

      Alert.alert(
        "¿Descartar cambios?",
        `Tienes comensales sin ordenar (${nombresEnRiesgo}). Si sales ahora, estos espacios se borrarán.`,
        [
          { text: "No salir", style: "cancel", onPress: () => {} },
          {
            text: "Salir y Borrar",
            style: "destructive",
            // Si dice que sí, ejecutamos la acción que intentó hacer (ir atrás)
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, comensales]); // 👈 Importante: depende de 'comensales' para ver el estado actual

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header (Igual) */}
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
          {/* Suma total de todos los comensales */}
          <Text style={styles.totalMesa}>
            ${comensales.reduce((acc, c) => acc + c.total, 0).toFixed(2)}
          </Text>
        </View>
      </View>

      <FlatList
        data={comensales}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderComensal}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addComensalBtn}
            onPress={agregarComensal}
          >
            <Ionicons name="person-add-outline" size={20} color="#FA9623" />
            <Text style={styles.addComensalText}>Agregar otro comensal</Text>
          </TouchableOpacity>
        }
      />

      {/* Modal Editar Nombre (Igual) */}
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
  addComensalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FA9623",
    borderStyle: "dashed",
  },
  addComensalText: {
    color: "#FA9623",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },

  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    backgroundColor: "#FA9623",
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  backButton: { padding: 5 },
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
  totalMesa: { color: "#FFF", fontWeight: "bold" },
  listContent: { padding: 16, paddingBottom: 40 },
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
  cardHeader: { marginBottom: 12 },
  nameClickable: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardName: { fontSize: 16, fontWeight: "bold", color: "#333", maxWidth: 180 },
  cardTotal: { fontSize: 16, fontWeight: "bold", color: "#333" },
  itemsList: {
    marginVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 8,
  },
  itemName: { fontSize: 15, fontWeight: "500", color: "#333" },
  itemPriceSmall: {
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "600",
    marginTop: 2,
  },
  timeRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  timeText: { fontSize: 11, color: "#757575", marginLeft: 4 },
  statusBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: { color: "#2196F3", fontSize: 10, fontWeight: "bold" },
  emptyText: {
    fontSize: 12,
    color: "#CCC",
    fontStyle: "italic",
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: "#FA9623",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
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
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtn: { backgroundColor: "#F5F5F5", marginRight: 10 },
  saveBtn: { backgroundColor: "#FA9623" },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  saveBtnText: { color: "#FFF", fontWeight: "600" },
});
