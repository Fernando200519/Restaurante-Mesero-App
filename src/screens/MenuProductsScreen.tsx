import React, { useRef, useEffect } from "react";

import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";

import { useMenuProductos } from "../hooks/useMenuProductos";
import MenuHeader from "../components/MenuHeader";
import ProductDetailsModal from "../components/ProductDetailsModal";
import { COLORS, SPACING } from "../constants/theme";

const CategoryCard = ({ item, onPress }: any) => (
  <TouchableOpacity
    style={styles.catCard}
    onPress={() => onPress(item)}
    activeOpacity={0.8}
  >
    <View style={styles.catIconContainer}>
      <Ionicons
        name={item.tipo === "Bebidas" ? "wine" : "restaurant"}
        size={24}
        color={COLORS.primary}
      />
    </View>
    <Text style={styles.catName} numberOfLines={2}>
      {item.nombre}
    </Text>
    <Ionicons name="chevron-forward" size={16} color={COLORS.text.muted} />
  </TouchableOpacity>
);

const ProductCard = ({ item, onAdd }: any) => {
  const imageUrl = item.imagen ? `${item.imagen}#.jpg` : null;

  return (
    <TouchableOpacity
      style={styles.prodCard}
      onPress={() => onAdd(item)}
      activeOpacity={0.9}
    >
      <View style={styles.prodImageContainer}>
        {item.imagen ? (
          <Image
            style={styles.prodImage}
            source={imageUrl}
            contentFit="cover"
            transition={400}
            cachePolicy="disk"
          />
        ) : (
          <View style={styles.placeholderOverlay}>
            <Ionicons
              name="fast-food-outline"
              size={30}
              color={COLORS.surface}
            />
          </View>
        )}
      </View>

      <View style={styles.prodInfo}>
        <Text style={styles.prodName} numberOfLines={2}>
          {item.nombre}
        </Text>
        <Text style={styles.prodPrice}>${item.precio.toFixed(2)}</Text>
      </View>
      <View style={styles.addIcon}>
        <Ionicons name="add" size={20} color={COLORS.white} />
      </View>
    </TouchableOpacity>
  );
};

export default function MenuProductosScreen({ navigation, route }: any) {
  const { headerProps, gridProps, orderContext, modalProps, notification } =
    useMenuProductos(navigation, route);

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gridProps.loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      shimmerAnim.setValue(0);
    }
  }, [gridProps.loading]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <MenuHeader {...headerProps} />

      <FlatList<any>
        data={gridProps.items}
        keyExtractor={(item) => item.id.toString()}
        numColumns={
          gridProps.items.length > 0 && gridProps.isCategory(gridProps.items[0])
            ? 1
            : 2
        }
        key={
          gridProps.items.length > 0 && gridProps.isCategory(gridProps.items[0])
            ? "v"
            : "h"
        }
        renderItem={({ item }) =>
          gridProps.isCategory(item) ? (
            <CategoryCard item={item} onPress={gridProps.onPressItem} />
          ) : (
            <ProductCard item={item} onAdd={gridProps.onPressItem} />
          )
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={50} color={COLORS.surface} />
            <Text style={styles.emptyText}>No encontramos lo que buscas</Text>
          </View>
        }
      />

      {/* BARRA DE CARRITO: Resumen flotante inferior */}
      {orderContext.cart.length > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartCount}>
              {orderContext.cart.length} productos
            </Text>
            <Text style={styles.cartTotal}>
              Total: ${orderContext.total.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() =>
              navigation.navigate("ResumenPedido", {
                cart: orderContext.cart,
                comensalNombre: orderContext.comensalNombre,
                orderId: orderContext.orderId,
                mesaId: headerProps.mesaId,
                updateCart: orderContext.setCart,
              })
            }
          >
            <Text style={styles.confirmBtnText}>Revisar Orden</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Notificación de Producto Añadido (Toast) */}
      {notification.visible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{notification.message}</Text>
        </View>
      )}

      <ProductDetailsModal {...modalProps} />

      {/* 🚀 OVERLAY DE CARGA MEJORADO */}
      {gridProps.loading && (
        <View style={styles.loadingOverlay}>
          <BlurView
            intensity={30}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Obteniendo opciones...</Text>

            {/* BARRA DE CARGA ANIMADA (SHIMMER) */}
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    opacity: shimmerAnim,
                    transform: [
                      {
                        translateX: shimmerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-100, 100],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: SPACING.m, paddingBottom: 120 },
  catCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.m,
    borderRadius: 16,
    marginBottom: SPACING.s,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  catIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.m,
  },
  catName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  prodCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    margin: 6,
    borderRadius: 20,
    padding: 10,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  prodInfo: { paddingHorizontal: 4 },
  prodName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text.primary,
    height: 40,
  },
  prodPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 4,
  },
  addIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBar: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#1F2937",
    padding: SPACING.m,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
  },
  cartCount: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  cartTotal: { color: COLORS.white, fontSize: 18, fontWeight: "800" },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  confirmBtnText: { color: COLORS.white, fontWeight: "700", marginRight: 5 },

  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { color: COLORS.text.muted, marginTop: 10, fontSize: 15 },
  toast: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    zIndex: 100,
  },
  toastText: { color: COLORS.white, fontWeight: "600" },

  prodImageContainer: {
    height: 100,
    backgroundColor: "#F9FAFB",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 8,
  },
  prodImage: {
    width: "100%",
    height: "100%",
  },
  placeholderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 24,
    alignItems: "center",
    width: "70%",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  progressBarContainer: {
    height: 6,
    width: 140,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    marginTop: 15,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    width: "60%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
});
