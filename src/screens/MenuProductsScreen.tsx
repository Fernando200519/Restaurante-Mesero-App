import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { useAuth } from "../context/AuthContext";
import { productosApi } from "../api/productosApi";
import { Categoria, Producto } from "../types/producto";
import ProductDetailsModal from "../components/ProductDetailsModal";

interface CartItem {
  producto: Producto;
  cantidad: number;
  opciones?: any[];
}

interface MenuProductosParams {
  comensalId: number;
  comensalNombre: string;
  mesaId: number;
  orderId: number;
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
  // Aquí le decimos a RouteProp qué estructura esperar
  route: RouteProp<{ MenuProductos: MenuProductosParams }, "MenuProductos">;
}

export default function MenuProductosScreen({ navigation, route }: Props) {
  // TypeScript ahora reconocerá estas propiedades gracias a la interface anterior
  const { comensalId, comensalNombre, mesaId, orderId } = route.params;
  const { token, signOut } = useAuth();

  // 2. ESTADOS DE DATOS
  const [loading, setLoading] = useState(true);
  const [todasLasCategorias, setTodasLasCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");

  // 3. ESTADO DE NAVEGACIÓN (BREADCRUMBS)
  const [navigationPath, setNavigationPath] = useState<Categoria[]>([]);

  // 4. ESTADOS DE CARRITO Y MODALES
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
  });

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        // Dentro de loadData() en MenuProductosScreen.tsx
        const [catsData, prodsData] = await Promise.all([
          productosApi.getCategorias(token),
          productosApi.getProductos(token),
        ]);

        // Forzamos el tipo para que TS sepa que cumplen con la interface nueva
        setTodasLasCategorias(catsData as Categoria[]);
        setProductos(prodsData as Producto[]);
      } catch (error: any) {
        console.error("Error cargando menú:", error);
        if (error.message?.includes("Sesión expirada")) {
          signOut();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  // --- LÓGICA DE FILTRADO (EL CORAZÓN DEL DISEÑO) ---
  const currentCategory = navigationPath[navigationPath.length - 1];

  const itemsAMostrar = useMemo<(Producto | Categoria)[]>(() => {
    // 👈 Agregamos el tipo genérico aquí
    if (search.length > 0) {
      return productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(search.toLowerCase()) &&
          (p.estado === "Activo" || p.estado === "Activa")
      );
    }

    if (!currentCategory) {
      return todasLasCategorias.filter(
        (c) => !c.categoriaPadreId || c.categoriaPadreId === 0
      );
    }

    const subcats = todasLasCategorias.filter(
      (c) => c.categoriaPadreId === currentCategory.id
    );
    if (subcats.length > 0) return subcats;

    return productos.filter((p) => p.categoryId === currentCategory.id);
  }, [search, currentCategory, todasLasCategorias, productos]);

  // --- MANEJADORES DE EVENTOS ---
  const handleItemPress = (item: any) => {
    // Si el item no tiene 'precio', es una categoría
    if (item.precio === undefined) {
      setNavigationPath([...navigationPath, item]);
    } else {
      handleAddPress(item);
    }
  };

  const handleBreadcrumbPress = (index: number) => {
    if (index === -1) setNavigationPath([]);
    else setNavigationPath(navigationPath.slice(0, index + 1));
  };

  const handleAddPress = (producto: Producto) => {
    // Verificamos si tiene complementos o ingredientes en el JSON real
    const tieneOpciones =
      (producto.complementos?.length ?? 0) > 0 ||
      (producto.ingredientesOpcionales?.length ?? 0) > 0;

    if (tieneOpciones) {
      setSelectedProduct(producto);
      setModalVisible(true);
    } else {
      addToCartDirect(producto);
    }
  };

  const addToCartDirect = (
    producto: Producto,
    opciones: any[] = [],
    precioFinal?: number
  ) => {
    setNotification({ visible: true, message: `¡${producto.nombre} añadido!` });
    setTimeout(() => setNotification({ visible: false, message: "" }), 1500);

    setCart((prev) => {
      const nuevoPrecio = precioFinal || producto.precio;
      // Para simplificar, si tiene opciones siempre lo agregamos como item nuevo
      if (opciones.length > 0) {
        return [
          ...prev,
          {
            producto: { ...producto, precio: nuevoPrecio },
            cantidad: 1,
            opciones,
          },
        ];
      }
      const existe = prev.find(
        (i) => i.producto.id === producto.id && !i.opciones
      );
      if (existe) {
        return prev.map((i) =>
          i === existe ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const handleConfirmCustomization = (
    prod: any,
    opts: any[],
    price: number
  ) => {
    addToCartDirect(prod, opts, price);
    setModalVisible(false);
  };

  const handleVerOrden = () => {
    navigation.navigate("ResumenPedido", {
      cart,
      comensalNombre,
      comensalId,
      mesaId,
      orderId,
      updateCart: (nuevoCarrito: CartItem[]) => setCart(nuevoCarrito),
    });
  };

  const cartTotal = cart.reduce(
    (acc, i) => acc + i.producto.precio * i.cantidad,
    0
  );
  const cartCount = cart.reduce((acc, i) => acc + i.cantidad, 0);

  // --- RENDERIZADO ---
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* SECCIÓN SUPERIOR: Header y Buscador */}
      <View style={styles.topSection}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerLabel}>Mesa {mesaId}</Text>
            <Text style={styles.headerName}>{comensalNombre}</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9E9E9E" />
            <TextInput
              placeholder="Buscar por nombre..."
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#9E9E9E" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* BREADCRUMBS */}
      {search.length === 0 && (
        <View style={styles.breadcrumbWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity onPress={() => handleBreadcrumbPress(-1)}>
              <Text style={styles.breadcrumbText}>Inicio</Text>
            </TouchableOpacity>
            {navigationPath.map((cat, index) => (
              <View key={cat.id} style={styles.breadcrumbItem}>
                <Ionicons name="chevron-forward" size={14} color="#9E9E9E" />
                <TouchableOpacity onPress={() => handleBreadcrumbPress(index)}>
                  <Text
                    style={[
                      styles.breadcrumbText,
                      index === navigationPath.length - 1 &&
                        styles.breadcrumbActive,
                    ]}
                  >
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* GRID DE CONTENIDO */}
      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 50 }}
          color="#FA9623"
          size="large"
        />
      ) : (
        <FlatList<Producto | Categoria> // 👈 Especificamos el tipo aquí también
          data={itemsAMostrar}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => {
            const isProduct = "precio" in item;

            if (!isProduct) {
              const categoria = item as Categoria;
              return (
                <TouchableOpacity
                  style={[styles.card, styles.categoryCard]}
                  onPress={() => handleItemPress(categoria)}
                >
                  <View style={styles.folderIconContainer}>
                    <Ionicons name="folder" size={50} color="#FA9623" />
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {categoria.nombre}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            } else {
              // Aquí TypeScript ya sabe que 'item' es un Producto
              const producto = item as Producto;
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleItemPress(producto)}
                >
                  <Image
                    source={{
                      uri: producto.imagen || "https://placehold.co/400",
                    }}
                    style={styles.cardImage}
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {producto.nombre}
                    </Text>
                    <Text style={styles.cardPrice}>
                      ${producto.precio.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.addButtonMini}>
                    <Ionicons name="add" size={20} color="#FFF" />
                  </View>
                </TouchableOpacity>
              );
            }
          }}
          ListEmptyComponent={
            <Text
              style={{ textAlign: "center", marginTop: 40, color: "#9E9E9E" }}
            >
              No se encontraron resultados
            </Text>
          }
        />
      )}

      {/* BARRA DE CARRITO FLOTANTE */}
      {cartCount > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity
            style={styles.floatingCart}
            onPress={handleVerOrden}
          >
            <View style={styles.cartInfoWrapper}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
              <Text style={styles.totalText}>${cartTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.btnAction}>
              <Text style={styles.btnText}>Ver Orden</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL Y TOAST */}
      <ProductDetailsModal
        visible={isModalVisible}
        producto={selectedProduct}
        onClose={() => setModalVisible(false)}
        onAddToCart={handleConfirmCustomization}
      />
      {notification.visible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{notification.message}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  topSection: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  header: { flexDirection: "row", alignItems: "center", padding: 20 },
  backBtn: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    marginRight: 15,
  },
  headerLabel: {
    fontSize: 10,
    color: "#9E9E9E",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  headerName: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 15 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  breadcrumbWrapper: {
    paddingHorizontal: 20,
    // 👇 ELIMINA ESTA LÍNEA:
    // py: 12,
    backgroundColor: "#FFF",
    paddingVertical: 12, // Esto ya hace el trabajo de 'py'
  },
  breadcrumbItem: { flexDirection: "row", alignItems: "center" },
  breadcrumbText: { fontSize: 14, color: "#9E9E9E", marginHorizontal: 5 },
  breadcrumbActive: { color: "#FA9623", fontWeight: "bold" },
  gridContent: { padding: 20 },
  card: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 15,
    elevation: 2,
    overflow: "hidden",
  },
  categoryCard: {
    height: 130,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  folderIconContainer: { alignItems: "center" },
  categoryName: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },
  cardImage: { width: "100%", height: 110 },
  cardInfo: { padding: 10 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#333" },
  cardPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#10B981",
    marginTop: 2,
  },
  addButtonMini: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FA9623",
    borderRadius: 10,
    padding: 4,
  },
  floatingCartContainer: {
    position: "absolute",
    bottom: 25,
    width: "100%",
    // 👇 ELIMINA ESTA LÍNEA:
    // px: 20,
    paddingHorizontal: 20, // Esta es la propiedad que React Native sí entiende
  },
  floatingCart: {
    backgroundColor: "#1A1A1A",
    flexDirection: "row",
    borderRadius: 15,
    padding: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartInfoWrapper: { flexDirection: "row", alignItems: "center" },
  badge: {
    backgroundColor: "#FA9623",
    paddingHorizontal: 8,
    // 👇 CAMBIO: Reemplaza 'py' por 'paddingVertical'
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 10,
  },
  badgeText: { color: "#FFF", fontWeight: "bold" },
  totalText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  btnAction: { flexDirection: "row", alignItems: "center" },
  btnText: { color: "#FFF", fontWeight: "bold", marginRight: 5 },
  toast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 20,
  },
  toastText: { color: "#FFF", fontWeight: "bold" },
});
