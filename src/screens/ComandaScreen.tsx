import React, { useState, useEffect } from "react";
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
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

// Definimos la estructura local de un Comensal para esta pantalla
interface ComensalLocal {
  id: number;
  nombre: string;
  total: number;
  itemsCount: number;
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, "Comanda">;
}

export default function ComandaScreen({ navigation, route }: Props) {
  // Recibimos los parámetros del Modal de Apertura
  const { mesaId, numeroMesa, numComensales } = route.params as {
    mesaId: string;
    numeroMesa: number;
    numComensales: number;
  };

  const [comensales, setComensales] = useState<ComensalLocal[]>([]);

  // Estados para el Modal de Editar Nombre
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingComensalId, setEditingComensalId] = useState<number | null>(
    null
  );
  const [tempName, setTempName] = useState("");

  // Al cargar, inicializamos los comensales (Simulación)
  // NOTA: Aquí más adelante haremos un GET al backend para ver si ya existen
  useEffect(() => {
    const inicializarComensales = () => {
      const nuevos: ComensalLocal[] = [];
      for (let i = 1; i <= numComensales; i++) {
        nuevos.push({
          id: i,
          nombre: `Comensal ${i}`, // Nombre por defecto
          total: 0,
          itemsCount: 0,
        });
      }
      setComensales(nuevos);
    };

    inicializarComensales();
  }, [numComensales]);

  // Función para abrir modal de editar nombre
  const openEditName = (id: number, currentName: string) => {
    setEditingComensalId(id);
    setTempName(currentName);
    setEditModalVisible(true);
  };

  // Guardar nuevo nombre
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
    });
  };

  // Renderizado de cada Tarjeta de Comensal
  const renderComensal = ({ item }: { item: ComensalLocal }) => (
    <View style={styles.card}>
      {/* Encabezado de la tarjeta */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.cardName}>{item.nombre}</Text>
            <TouchableOpacity
              onPress={() => openEditName(item.id, item.nombre)}
              style={styles.editIcon}
            >
              <Ionicons name="pencil" size={14} color="#9E9E9E" />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardStatus}>
            {item.itemsCount === 0
              ? "Sin ordenar"
              : `${item.itemsCount} artículos`}
          </Text>
        </View>
        <Text style={styles.cardTotal}>${item.total.toFixed(2)}</Text>
      </View>

      {/* Botón de Acción Principal */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleTomarOrden(item)}
      >
        <Ionicons
          name="restaurant-outline"
          size={18}
          color="#FFF"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.actionButtonText}>Tomar Orden</Text>
      </TouchableOpacity>
    </View>
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
    paddingTop: 10, // Ajuste extra si usas SafeAreaView con edges
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
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  editIcon: {
    marginLeft: 8,
    padding: 4,
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
