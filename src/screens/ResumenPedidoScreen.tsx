import React, { useState } from "react";

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

import { mesasApi } from "../api/mesasApi";
import { useAuth } from "../context/AuthContext";
import { COLORS, SPACING } from "../constants/theme";

export default function ResumenPedidoScreen({ navigation, route }: any) {
  const { user, token } = useAuth();
  const {
    cart: initialCart,
    comensalNombre,
    mesaId,
    orderId,
    updateCart,
  } = route.params;

  const [localCart, setLocalCart] = useState(initialCart);
  const [loading, setLoading] = useState(false);

  const total = localCart.reduce(
    (acc: number, item: any) =>
      acc + (item.precioUnitario || 0) * item.cantidad,
    0
  );

  // ✅ PASO 2: Actualizar cantidad usando el cartItemId único
  const updateQty = (cartItemId: string, delta: number) => {
    setLocalCart((prev: any[]) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = Math.max(1, item.cantidad + delta);
          return { ...item, cantidad: newQty };
        }
        return item;
      })
    );
  };

  // ✅ PASO 3: Eliminar usando el cartItemId único
  const handleDelete = (cartItemId: string) => {
    Alert.alert("Eliminar", "¿Quitar este producto del pedido?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () =>
          setLocalCart((prev: any[]) =>
            prev.filter((i) => i.cartItemId !== cartItemId)
          ),
      },
    ]);
  };

  const handleBack = () => {
    if (updateCart) updateCart(localCart);
    navigation.goBack();
  };

  const handleEnviarCocina = async () => {
    if (!token || !orderId) {
      Alert.alert("Error", "Información incompleta.");
      return;
    }

    setLoading(true);
    try {
      await mesasApi.agregarProductosOrden(
        orderId,
        localCart,
        comensalNombre,
        token
      );

      navigation.pop(2);
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", "No se pudo enviar: " + error.message);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const unitPrice = item.precioUnitario || 0;

    const complementos = item.opcionesSeleccionadas?.filter(
      (o: any) => o.tipo === "complemento"
    );
    const personalizaciones = item.opcionesSeleccionadas?.filter(
      (o: any) => o.tipo === "ingrediente"
    );

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.producto.imagen }} style={styles.image} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.prodName} numberOfLines={1}>
              {item.producto.nombre}
            </Text>
            {/* ✅ Usamos cartItemId aquí */}
            <TouchableOpacity onPress={() => handleDelete(item.cartItemId)}>
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          {/* ✅ BLOQUE DE EXTRAS (CON COSTO) */}
          {complementos?.length > 0 && (
            <View style={styles.optionContainer}>
              <Ionicons
                name="add-circle-outline"
                size={12}
                color={COLORS.primary}
              />
              <Text style={styles.complementosText}>
                Extras: {complementos.map((o: any) => o.nombre).join(", ")}
              </Text>
            </View>
          )}

          {/* ✅ BLOQUE DE CAMBIOS (SIN COSTO) */}
          {personalizaciones?.length > 0 && (
            <View style={styles.optionContainer}>
              <Ionicons
                name="remove-circle-outline"
                size={12}
                color={COLORS.text.muted}
              />
              <Text style={styles.personalizarText}>
                Cambios:{" "}
                {personalizaciones.map((o: any) => o.nombre).join(", ")}
              </Text>
            </View>
          )}

          {item.comentario ? (
            <View style={styles.notaRow}>
              <Ionicons
                name="chatbox-ellipses-outline"
                size={12}
                color={COLORS.text.muted}
              />
              <Text style={styles.notaText}>"{item.comentario}"</Text>
            </View>
          ) : null}

          {/* ✅ PRECIO UNITARIO (YA TIENE EXTRAS) */}
          <Text style={styles.priceUnit}>${unitPrice.toFixed(2)} c/u</Text>

          <View style={styles.cardFooter}>
            <View style={styles.qtySelector}>
              {/* BOTÓN MENOS: ✅ Asegúrate que use item.cartItemId */}
              <TouchableOpacity
                onPress={() => updateQty(item.cartItemId, -1)}
                style={styles.qtyBtn}
              >
                <Ionicons name="remove" size={16} color={COLORS.text.primary} />
              </TouchableOpacity>

              <Text style={styles.qtyValue}>{item.cantidad}</Text>
              <TouchableOpacity
                onPress={() => updateQty(item.cartItemId, 1)}
                style={styles.qtyBtn}
              >
                <Ionicons name="add" size={16} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            {/* ✅ TOTAL POR LÍNEA (Precio con extras * cantidad) */}
            <Text style={styles.itemTotal}>
              ${(unitPrice * item.cantidad).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* CUSTOM HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Revisar Orden</Text>
          <Text style={styles.headerSubtitle}>
            Mesa {mesaId} • {comensalNombre}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={localCart}
        // ✅ PASO 4: Usar el cartItemId para que React no se confunda
        keyExtractor={(item) => item.cartItemId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color={COLORS.surface} />
            <Text style={styles.emptyText}>No hay productos en el resumen</Text>
            <TouchableOpacity style={styles.returnBtn} onPress={handleBack}>
              <Text style={styles.returnBtnText}>Volver al Menú</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {localCart.length > 0 && (
        <View style={styles.checkoutContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a enviar:</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handleBack}
              disabled={loading}
            >
              <Text style={styles.btnSecondaryText}>Seguir Pidiendo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: COLORS.primary }]}
              onPress={handleEnviarCocina}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="send"
                    size={18}
                    color={COLORS.white}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.btnPrimaryText}>Enviar Pedido</Text>
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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: {
    padding: 8,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
  },
  headerTitleContainer: { alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text.primary },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  list: { padding: SPACING.m, paddingBottom: 150 },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
  },
  cardContent: {
    flex: 1,
    marginLeft: SPACING.m,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prodName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.primary,
    flex: 1,
  },
  priceUnit: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  qtySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  qtyBtn: { padding: 8 },
  qtyValue: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text.primary,
    minWidth: 24,
    textAlign: "center",
  },
  itemTotal: { fontSize: 16, fontWeight: "800", color: COLORS.text.primary },

  checkoutContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: COLORS.white,
    padding: SPACING.l,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  totalLabel: { fontSize: 16, color: COLORS.text.secondary, fontWeight: "600" },
  totalValue: { fontSize: 28, fontWeight: "900", color: COLORS.text.primary },
  actionRow: { flexDirection: "row", gap: 12 },
  btnSecondary: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: "center",
  },
  btnSecondaryText: { color: COLORS.primary, fontWeight: "800", fontSize: 15 },
  btnPrimary: {
    flex: 1.5,
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  btnPrimaryText: { color: COLORS.white, fontWeight: "800", fontSize: 16 },

  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: {
    color: COLORS.text.muted,
    fontSize: 16,
    marginVertical: SPACING.m,
  },
  returnBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  returnBtnText: { color: COLORS.text.secondary, fontWeight: "700" },
  notaRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  notaText: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },

  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  complementosText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
    marginLeft: 4,
  },
  personalizarText: {
    fontSize: 11,
    color: COLORS.text.muted,
    fontStyle: "italic",
    marginLeft: 4,
  },
});
