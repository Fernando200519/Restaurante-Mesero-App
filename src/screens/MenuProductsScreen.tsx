import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext"; // 👈 Importamos Auth
import { productosApi } from "../api/productosApi"; // 👈 Importamos API
import { Categoria, Producto } from "../types/producto"; // 👈 Importamos Tipos
import ProductDetailsModal from "../components/ProductDetailsModal";

// --- NUEVAS INTERFACES ---
export interface OpcionModificador {
  id: number;
  nombre: string;
  precio: number; // Si es 0, es gratis (ej. "Sin cebolla")
}

export interface GrupoModificadores {
  id: string;
  titulo: string; // Ej. "Elige el término", "Extras"
  opciones: OpcionModificador[];
  min: number; // 0 = Opcional, 1 = Obligatorio
  max: number; // 1 = Selección única (Radio), >1 = Múltiple (Checkbox)
}

// ✅ CORRECCIÓN
interface CartItem {
  producto: Producto;
  cantidad: number;
  opciones?: any[];
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, "MenuProductos">;
}

export default function MenuProductosScreen({ navigation, route }: Props) {
  const { comensalId, comensalNombre, mesaId } = route.params as {
    comensalId: number;
    comensalNombre: string;
    mesaId: number;
  };
  // 👇 1. OBTENER TOKEN
  const { token } = useAuth();

  // 👇 2. NUEVOS ESTADOS PARA DATOS REALES
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const [search, setSearch] = useState("");
  // 👇 3. CAMBIO IMPORTANTE: Ahora filtramos por ID (número), no por nombre
  // 0 significará "Todas las categorías"
  const [activeCategoryId, setActiveCategoryId] = useState<number>(0);

  // Estado local del Carrito (Solo para esta sesión de pedido)
  const [cart, setCart] = useState<CartItem[]>([]);

  // Estados para el Modal
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  // 👇 CARGAR DATOS REALES AL INICIAR
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      setLoading(true);
      try {
        // Pedimos categorías y productos al mismo tiempo (Paralelo)
        const [catsData, prodsData] = await Promise.all([
          productosApi.getCategorias(token),
          productosApi.getProductos(token),
        ]);

        setCategorias(catsData);
        setProductos(prodsData);
      } catch (error) {
        console.error("Error cargando menú:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  // 👇 FILTRADO ACTUALIZADO (Usando ID)
  const productosFiltrados = useMemo(() => {
    // Usamos el estado 'productos' en lugar de 'PRODUCTOS_MOCK'
    return productos.filter((p) => {
      // 1. Filtro por Categoría: Si es 0 (Todas) o coincide el ID
      const matchCat =
        activeCategoryId === 0 || p.categoryId === activeCategoryId;

      // 2. Filtro por Buscador
      const matchText = p.nombre.toLowerCase().includes(search.toLowerCase());

      // 3. Filtro de Estado (Opcional, pero recomendado)
      const matchEstado = p.estado === "Activo" || p.estado === "Activa";

      return matchCat && matchText && matchEstado;
    });
  }, [activeCategoryId, search, productos]);

  // Cálculos del Carrito Flotante
  const cartTotal = cart.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  );
  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  // --- LÓGICA MODIFICADA DE AGREGAR ---
  const handleAddPress = (producto: Producto) => {
    if (producto.esPersonalizable) {
      // CASO B: Es personalizable -> Abrimos Modal
      setSelectedProduct(producto);
      setModalVisible(true);
    } else {
      // CASO A: Es simple -> Agregamos directo (Lógica vieja)
      addToCartDirect(producto);
    }
  };

  // Función para agregar al carrito (ya sea directo o desde modal)
  const addToCartDirect = (
    producto: Producto,
    opciones: any[] = [],
    precioFinal?: number
  ) => {
    setCart((prev) => {
      // NOTA IMPORTANTE: Si tiene opciones, se considera un item "nuevo" distinto
      // para no mezclar una "Pizza con Piña" con una "Pizza sin Piña".

      const precioItem = precioFinal || producto.precio;

      // Creamos un ID único temporal para el carrito basado en opciones
      // (O simplemente agregamos siempre como nuevo item si tiene opciones)
      if (opciones.length > 0) {
        return [
          ...prev,
          {
            producto: { ...producto, precio: precioItem },
            cantidad: 1,
            opciones,
          },
        ];
      }

      // Si es simple, buscamos si ya existe para sumar cantidad
      const existente = prev.find(
        (item) =>
          item.producto.id === producto.id &&
          (!item.opciones || item.opciones.length === 0)
      );

      if (existente) {
        return prev.map((item) =>
          item === existente ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }

      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const handleConfirmCustomization = (
    producto: any, // 👈 CAMBIO AQUÍ: Usa 'any' en lugar de 'Product'
    opciones: any[],
    precioFinal: number,
    notas: string
  ) => {
    // Al usar 'any', TypeScript deja de comparar las propiedades una por una
    // y confía en que el objeto que viene es el correcto.
    addToCartDirect(producto, opciones, precioFinal);
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const handleVerOrden = () => {
    navigation.navigate("ResumenPedido", {
      cart: cart,
      comensalNombre: comensalNombre,
      comensalId: comensalId,
      mesaId: mesaId || 0, // Pasarlo si lo tienes
    });
  };

  // ✅ CORRECCIÓN: Usamos 'Producto' en el tipo del argumento
  const renderProduct = ({ item }: { item: Producto }) => (
    <View style={styles.card}>
      <Image
        source={{
          uri: item.imagen
            ? item.imagen
            : "https://placehold.co/400x300/e0e0e0/999999?text=Sin+Imagen", // 👈 Usamos una URL genérica
        }}
        style={styles.cardImage}
      />
      {/* Como tu backend aun no trae 'esPersonalizable', quitamos o comentamos esa validación por ahora */}
      {/* item.esPersonalizable && (...) */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.nombre}
        </Text>
        <Text style={styles.cardPrice}>${item.precio.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.7}
        onPress={() => handleAddPress(item)}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      {/* HEADER: Contexto del Comensal */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerLabel}>Ordenando para:</Text>
          <Text style={styles.headerName}>{comensalNombre}</Text>
        </View>
      </View>
      {/* BUSCADOR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9E9E9E" />
          <TextInput
            placeholder="Buscar producto..."
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
      {/* CATEGORÍAS (Horizontal) */}
      <View>
        <FlatList
          // 👇 Inyectamos la opción "Todas" (ID 0) manualmente al principio del array real
          data={[
            { id: 0, nombre: "Todas", descripcion: "", estado: "" },
            ...categorias,
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.catList}
          renderItem={({ item }) => {
            // Comparamos IDs
            const isActive = activeCategoryId === item.id;
            return (
              <TouchableOpacity
                style={[styles.catChip, isActive && styles.catChipActive]}
                onPress={() => setActiveCategoryId(item.id)}
              >
                <Text
                  style={[styles.catText, isActive && styles.catTextActive]}
                >
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      {/* GRID DE PRODUCTOS */}
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        // Espacio extra abajo para que el carrito flotante no tape el último item
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
      {/* 🛒 CARRITO FLOTANTE (Solo si hay items) */}
      {cartCount > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity
            style={styles.floatingCart}
            onPress={handleVerOrden}
            activeOpacity={0.9}
          >
            {/* Lado Izquierdo: Resumen */}
            <View style={styles.cartInfo}>
              <View style={styles.cartCountBadge}>
                <Text style={styles.cartCountText}>{cartCount}</Text>
              </View>
              <View>
                <Text style={styles.cartUserText}>
                  Orden de {comensalNombre}
                </Text>
                <Text style={styles.cartTotalText}>
                  ${cartTotal.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Lado Derecho: Botón Acción */}
            <View style={styles.cartAction}>
              <Text style={styles.cartActionText}>Ver Orden</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}
      <ProductDetailsModal
        visible={isModalVisible}
        producto={selectedProduct}
        onClose={() => setModalVisible(false)}
        onAddToCart={handleConfirmCustomization}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFF",
  },
  backBtn: { marginRight: 15 },
  headerLabel: { fontSize: 12, color: "#757575" },
  headerName: { fontSize: 18, fontWeight: "bold", color: "#FA9623" },

  // Search
  searchContainer: { padding: 16, backgroundColor: "#FFF", paddingBottom: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },

  // Categorías
  catList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#FFF",
  },
  catChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  catChipActive: { backgroundColor: "#FA9623" },
  catText: { fontSize: 14, color: "#666", fontWeight: "600" },
  catTextActive: { color: "#FFF" },

  // Grid Productos
  gridContent: { padding: 16 },
  card: {
    backgroundColor: "#FFF",
    width: "48%", // Un poco menos de 50 para el espacio
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#EEE",
  },
  cardInfo: { padding: 10, paddingBottom: 15 },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  cardPrice: { fontSize: 16, fontWeight: "bold", color: "#FA9623" },

  // Botón (+)
  addButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#FA9623",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    elevation: 4,
  },
  // Badge Personalizable
  badgeContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: { color: "#FFF", fontSize: 10, marginLeft: 4, fontWeight: "600" },

  // CARRITO FLOTANTE
  floatingCartContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  floatingCart: {
    backgroundColor: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  cartInfo: { flexDirection: "row", alignItems: "center" },
  cartCountBadge: {
    backgroundColor: "#FA9623",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cartCountText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  cartUserText: { color: "#BBB", fontSize: 12 },
  cartTotalText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  cartAction: { flexDirection: "row", alignItems: "center" },
  cartActionText: { color: "#FFF", fontWeight: "600", marginRight: 4 },
});
