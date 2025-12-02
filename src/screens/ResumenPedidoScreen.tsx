import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { mesasApi } from "../api/mesasApi"; // Importar API
import { useAuth } from "../context/AuthContext"; // Importar Auth

// Reutilizamos tipos (idealmente deberías tenerlos en un archivo types.ts compartido)
interface Product {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
}

interface CartItem {
  producto: Product;
  cantidad: number;
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, "ResumenPedido">;
}

export default function ResumenPedidoScreen({ navigation, route }: Props) {
  // 👇 1. Obtenemos user y token
  const { user, token } = useAuth();
  // Recibimos los datos del Menú
  const {
    cart: initialCart,
    comensalNombre,
    mesaId,
    orderId, // <--- ¡AGREGA ESTO!
  } = route.params as {
    cart: CartItem[];
    comensalNombre: string;
    comensalId: number;
    mesaId: number;
    orderId: number; // 👈 NECESITAMOS ESTO
  };

  const [localCart, setLocalCart] = useState<CartItem[]>(initialCart);
  const [loading, setLoading] = useState(false);

  // Cálculos dinámicos
  const subtotal = localCart.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  );
  const total = subtotal; // Aquí podrías sumar IVA o propina si aplicara

  // --- ACCIONES ---

  const handleIncrement = (id: number) => {
    setLocalCart((prev) =>
      prev.map((item) =>
        item.producto.id === id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };

  const handleDecrement = (id: number) => {
    setLocalCart((prev) =>
      prev.map((item) => {
        if (item.producto.id === id) {
          // No bajamos de 1 aquí, para eso está el botón eliminar
          return { ...item, cantidad: Math.max(1, item.cantidad - 1) };
        }
        return item;
      })
    );
  };

  const handleDelete = (id: number) => {
    Alert.alert("Eliminar producto", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () =>
          setLocalCart((prev) =>
            prev.filter((item) => item.producto.id !== id)
          ),
      },
    ]);
  };

  const handleSeguirAgregando = () => {
    // Simplemente volvemos atrás al menú
    // Nota: Idealmente deberíamos pasar el carrito actualizado de vuelta,
    // pero por simplicidad en este prototipo, solo volvemos.
    navigation.goBack();
  };

  const handleEnviarCocina = async () => {
    if (localCart.length === 0) return;

    // Validaciones de seguridad
    if (!token || !user || !user.id) {
      Alert.alert("Error", "No hay sesión activa");
      return;
    }
    // Si no tenemos orderId (quizás la mesa se abrió mal), alertamos
    if (!orderId) {
      Alert.alert("Error", "No se identificó el número de orden.");
      return;
    }

    setLoading(true);
    try {
      // 👇 2. LLAMADA REAL AL BACKEND
      await mesasApi.agregarProductosOrden(
        orderId,
        localCart,
        user.id,
        comensalNombre,
        token
      );

      Alert.alert("¡Enviado!", `Orden de ${comensalNombre} enviada a cocina.`, [
        {
          text: "OK",
          onPress: () => {
            // Regresamos a la pantalla de Comanda (Gestión de Comensales)
            // Esto limpiará el stack de menú y resumen
            navigation.navigate("Comanda", {
              mesaId,
              orderId, // Mantenemos el ID por si pide otro comensal
              refresh: Date.now(), // Trigger para recargar totales si lo implementas
            });
          },
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo enviar la orden al sistema.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.producto.imagen }} style={styles.image} />

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.prodName} numberOfLines={2}>
            {item.producto.nombre}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.producto.id)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <Text style={styles.unitPrice}>
          ${item.producto.precio.toFixed(2)} c/u
        </Text>

        <View style={styles.controlsRow}>
          {/* Controles de Cantidad */}
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              onPress={() => handleDecrement(item.producto.id)}
              style={styles.qtyBtn}
            >
              <Ionicons name="remove" size={18} color="#555" />
            </TouchableOpacity>

            <Text style={styles.qtyText}>{item.cantidad}</Text>

            <TouchableOpacity
              onPress={() => handleIncrement(item.producto.id)}
              style={styles.qtyBtn}
            >
              <Ionicons name="add" size={18} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Subtotal del item */}
          <Text style={styles.itemSubtotal}>
            ${(item.producto.precio * item.cantidad).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>Revisar Orden</Text>
          <Text style={styles.headerSubtitle}>{comensalNombre}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* LISTA DE ITEMS */}
      {localCart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={64} color="#DDD" />
          <Text style={styles.emptyText}>El carrito está vacío</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={handleSeguirAgregando}
          >
            <Text style={styles.emptyBtnText}>Volver al Menú</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={localCart}
          keyExtractor={(item) => item.producto.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FOOTER (RESUMEN Y BOTONES) */}
      {localCart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>

          <View style={styles.footerButtons}>
            {/* Botón Seguir Agregando */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleSeguirAgregando}
              disabled={loading}
            >
              <Text style={styles.secondaryBtnText}>Seguir agregando</Text>
            </TouchableOpacity>

            {/* Botón Enviar a Cocina */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleEnviarCocina}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons
                    name="paper-plane-outline"
                    size={20}
                    color="#FFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.primaryBtnText}>Enviar a Cocina</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  headerSubtitle: { fontSize: 13, color: "#FA9623", fontWeight: "600" },

  // Lista
  listContent: { padding: 16 },

  // Card
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#EEE",
  },
  cardBody: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  prodName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: { padding: 4 },
  unitPrice: { fontSize: 12, color: "#999", marginTop: -4 },

  // Controls
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  qtyBtn: { padding: 6, paddingHorizontal: 10 },
  qtyText: {
    fontSize: 15,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },
  itemSubtotal: { fontSize: 15, fontWeight: "bold", color: "#333" },

  // Footer
  footer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  totalLabel: { fontSize: 18, color: "#666" },
  totalAmount: { fontSize: 24, fontWeight: "bold", color: "#333" },

  footerButtons: { flexDirection: "row", gap: 12 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FA9623",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { color: "#FA9623", fontWeight: "bold", fontSize: 16 },
  primaryBtn: {
    flex: 1.5,
    backgroundColor: "#FA9623",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: { fontSize: 16, color: "#999", marginTop: 10, marginBottom: 20 },
  emptyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#EEE",
    borderRadius: 8,
  },
  emptyBtnText: { color: "#555", fontWeight: "600" },
});
