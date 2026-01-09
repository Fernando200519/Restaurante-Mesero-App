import { useEffect, useMemo, useState, useCallback } from "react";
import { productosApi } from "../api/productosApi";
import { useAuth } from "../context/AuthContext";
import { Categoria, Producto, CartItem } from "../types/producto";

export function useMenuProductos(navigation: any, route: any) {
  const { comensal, orderId, mesaNombre, mesaId } = route.params || {};
  const comensalNombre = comensal;
  const { token, signOut, refreshSession } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [navigationPath, setNavigationPath] = useState<Categoria[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
  });

  const loadInitialData = useCallback(
    async (tokenToUse: string) => {
      try {
        const [cats, prods] = await Promise.all([
          productosApi.getCategorias(tokenToUse),
          productosApi.getProductos(tokenToUse),
        ]);
        setCategorias(cats);
        setProductos(prods);
        setLoading(false);
      } catch (e: any) {
        if (e.message?.includes("Sesión expirada")) {
          const newToken = await refreshSession();
          if (newToken) {
            loadInitialData(newToken);
          } else {
            signOut();
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          }
        }
      }
    },
    [navigation, refreshSession, signOut]
  );

  useEffect(() => {
    if (token) loadInitialData(token);
  }, [token, loadInitialData]);

  const itemsAMostrar = useMemo(() => {
    if (search.trim()) {
      return productos.filter((p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
      );
    }

    const categoriasLimpias = categorias.filter(
      (c) => c.nombre !== "Sin Categoría" && c.id !== 3
    );

    if (navigationPath.length === 0) {
      return categoriasLimpias.filter(
        (c) =>
          !c.categoriaPadre ||
          c.categoriaPadre === "Alimentos" ||
          c.categoriaPadre === "Bebidas"
      );
    }

    const currentCategory = navigationPath[navigationPath.length - 1];
    const subcategorias = categoriasLimpias.filter(
      (c) => c.categoriaPadre === currentCategory.nombre
    );

    if (subcategorias.length > 0) return subcategorias;

    return productos.filter((p) => p.categoryId === currentCategory.id);
  }, [search, categorias, productos, navigationPath]);

  const handleSelectProduct = async (productoSimple: Producto) => {
    setLoadingDetail(true);
    try {
      const productoCompleto = await productosApi.getProductoDetail(
        productoSimple.id,
        token!
      );
      setSelectedProduct(productoCompleto);
      setModalVisible(true);
    } catch (error) {
      console.error("Error al cargar detalle", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAddToCart = (
    producto: Producto,
    opciones: any[] = [],
    precioFinal?: number,
    notas: string = ""
  ) => {
    setNotification({ visible: true, message: `¡${producto.nombre} añadido!` });
    setTimeout(() => setNotification({ visible: false, message: "" }), 2000);

    const finalPrice = precioFinal ?? producto.precio;

    setCart((prev) => [
      ...prev,
      {
        producto,
        cantidad: 1,
        opciones,
        notas,
        precioFinal: finalPrice,
      },
    ]);
  };

  return {
    headerProps: {
      mesaId,
      mesaNombre,
      comensalNombre,
      search,
      setSearch,
      onBack:
        navigationPath.length > 0
          ? () => setNavigationPath((prev) => prev.slice(0, -1))
          : () => navigation.goBack(),
    },
    gridProps: {
      loading: loading || loadingDetail,
      items: itemsAMostrar,
      isCategory: (item: any) => "subcategorias" in item,
      onPressItem: (item: any) => {
        if ("subcategorias" in item) {
          setNavigationPath((prev) => [...prev, item]);
        } else {
          handleSelectProduct(item);
        }
      },
    },
    modalProps: {
      visible: isModalVisible,
      producto: selectedProduct,
      onClose: () => setModalVisible(false),
      onAddToCart: (
        producto: any,
        opcionesSeleccionadas: any[],
        precioFinal: number,
        notas: string
      ) => {
        handleAddToCart(producto, opcionesSeleccionadas, precioFinal, notas);
        setModalVisible(false);
      },
    },
    orderContext: {
      orderId,
      comensalNombre,
      cart,
      setCart,
      total: cart.reduce(
        (acc, item) => acc + item.precioFinal * item.cantidad,
        0
      ),
    },
    notification,
  };
}
