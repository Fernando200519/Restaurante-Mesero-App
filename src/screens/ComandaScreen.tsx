import React, { useState, useLayoutEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar as RNStatusBar,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { useComensales } from "../hooks/useComensales";
import { ComensalCard } from "../components/ComensalCard";
import { EditComensalModal } from "../components/EditComensalModal";
import { UpdateDinersModal } from "../components/UpdateDinersModal";
import { ConfirmActionModal } from "../components/ConfirmActionModal";
import { OrderSettlementModal } from "../components/OrderSettlementModal/OrderSettlementModal";

import { COLORS, SPACING } from "../constants/theme";

const ComandaScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { orderId, mesaNombre, numComensales } = route.params;

  const [numComensalesMesa, setNumComensalesMesa] = useState(
    numComensales || 0
  );
  const [modalDinersVisible, setModalDinersVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelInfo, setCancelInfo] = useState<{
    id: number;
    mensaje: string;
  } | null>(null);
  const [productToDeliver, setProductToDeliver] = useState<number | null>(null);
  const [comensalEditandoId, setComensalEditandoId] = useState<
    string | number | null
  >(null);
  const [nombreTemporal, setNombreTemporal] = useState("");

  const {
    comensales,
    fetchOrdenActual,
    agregarComensal,
    eliminarComensal,
    renombrarComensal,
    entregarProducto,
    cancelarProducto,
    ejecutarPago,
    prepararLiquidacion,
    fullOrderData,
    isPreparingSettlement,
  } = useComensales(orderId, token);

  const isUserInteracting = useMemo(() => {
    return (
      modalVisible || modalDinersVisible || !!cancelInfo || !!productToDeliver
    );
  }, [modalVisible, modalDinersVisible, cancelInfo, productToDeliver]);

  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!isUserInteracting) {
        fetchOrdenActual();
      }

      const safetyTimer = setTimeout(() => {
        if (!isUserInteracting) fetchOrdenActual();
      }, 500);

      const interval = setInterval(() => {
        if (!isUserInteracting) fetchOrdenActual();
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(safetyTimer);
      };
    }, [fetchOrdenActual, isUserInteracting])
  );

  const handlePrepareCancel = (id: number, estado: string) => {
    const s = (estado || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .toUpperCase();

    let mensajeAviso = "";

    if (s === "SOLICITADO" || s === "ENPREPARACION") {
      mensajeAviso =
        "Este platillo aún está en proceso inicial. Se cancelará sin cargos para el comensal.";
    } else {
      mensajeAviso =
        "⚠️ ATENCIÓN: El platillo ya está listo o fue entregado. Se aplicará un recargo y el producto debe ser retirado.";
    }

    setCancelInfo({ id, mensaje: mensajeAviso });
  };

  const totalCuenta = useMemo(() => {
    return comensales.reduce((acc, comensal) => acc + comensal.total, 0);
  }, [comensales]);

  const esOrdenEnCheckout = useMemo(() => {
    return (
      fullOrderData?.estado === "Checkout" ||
      (fullOrderData?.total > 0 &&
        fullOrderData?.totalPagado < fullOrderData?.total)
    );
  }, [fullOrderData]);

  const handleFinalizar = async () => {
    if (esOrdenEnCheckout) {
      setPaymentModalVisible(true);
      return;
    }

    Alert.alert(
      "¿Cerrar cuenta?",
      "Al solicitar la cuenta, ya no se podrán añadir más productos. ¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, Cerrar Cuenta",
          style: "destructive",
          onPress: async () => {
            const success = await prepararLiquidacion();
            if (success) setPaymentModalVisible(true);
          },
        },
      ]
    );
  };

  const handleCancelConfirm = () => {
    if (cancelInfo) {
      cancelarProducto(cancelInfo.id);
      setCancelInfo(null);
    }
  };

  const handlePaymentConfirm = async (datosPago: any) => {
    setIsProcessingPayment(true);
    try {
      await ejecutarPago(datosPago, () => {
        setPaymentModalVisible(false);
        Alert.alert("Éxito", "Pago registrado y mesa lista para ser liberada.");
        navigation.navigate("Mesas");
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar el pago.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const headerPaddingTop = Platform.OS === "android" ? insets.top : 0;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: `${mesaNombre}`,
      headerTitleAlign: "center",
      headerStyle: {
        backgroundColor: COLORS.background,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleContainerStyle: {
        paddingTop: headerPaddingTop,
      },
      headerLeftContainerStyle: {
        paddingTop: headerPaddingTop,
        paddingLeft: SPACING.m,
      },
      headerRightContainerStyle: {
        paddingTop: headerPaddingTop,
        paddingRight: SPACING.m,
      },
      headerTitleStyle: {
        fontWeight: "800",
        color: COLORS.text.primary,
        fontSize: 18,
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerLeftButton}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setModalDinersVisible(true)}
          style={styles.headerIconButton}
          activeOpacity={0.7}
        >
          <View style={styles.dinersBadgeContainer}>
            <Ionicons name="people" size={22} color={COLORS.primary} />
            <View style={styles.miniBadgeCount}>
              <Text style={styles.miniBadgeText}>{numComensalesMesa}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, mesaNombre, numComensalesMesa, insets.top]);

  const abrirEditarNombre = (id: string | number, nombre: string) => {
    setComensalEditandoId(id);
    setNombreTemporal(nombre);
    setModalVisible(true);
  };

  const guardarNombre = () => {
    if (comensalEditandoId) {
      renombrarComensal(comensalEditandoId, nombreTemporal.trim());
    }
    setModalVisible(false);
    setComensalEditandoId(null);
    setNombreTemporal("");
  };

  const handleDeliverConfirm = () => {
    if (productToDeliver) {
      entregarProducto(productToDeliver);
      setProductToDeliver(null);
    }
  };

  const esCuentaFinalizable = useMemo(() => {
    if (comensales.length === 0) return false;

    return comensales.every(
      (comensal) =>
        comensal.items.length > 0 &&
        comensal.items.every((item) => {
          const s = (item.estado || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "")
            .toUpperCase();
          return s === "ENTREGADO" || s === "CANCELADO";
        })
    );
  }, [comensales]);

  return (
    <View style={styles.container}>
      <RNStatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {comensales.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={COLORS.surface} />
            <Text style={styles.emptyTitle}>Sin comensales</Text>
            <Text style={styles.emptySubtitle}>
              Agrega una tarjeta para comenzar a tomar la orden de este grupo.
            </Text>
          </View>
        ) : (
          comensales.map((item) => (
            <ComensalCard
              key={item.id.toString()}
              item={item}
              onEdit={() => abrirEditarNombre(item.id, item.nombre)}
              onDelete={() => eliminarComensal(item.id)}
              onDeliverProduct={(id) => setProductToDeliver(id)}
              onCancelProduct={handlePrepareCancel}
              onAddProducts={() =>
                navigation.navigate("MenuProductos", {
                  orderId,
                  mesaNombre,
                  comensal: item.nombre,
                })
              }
            />
          ))
        )}

        {esCuentaFinalizable && (
          <TouchableOpacity
            style={[
              styles.checkoutBtn,
              esOrdenEnCheckout && { backgroundColor: COLORS.primary },
            ]}
            onPress={handleFinalizar}
            activeOpacity={0.8}
          >
            <Ionicons
              name={esOrdenEnCheckout ? "cash" : "receipt"}
              size={24}
              color={COLORS.white}
            />
            <Text style={styles.checkoutText}>
              {esOrdenEnCheckout
                ? "Ver Ticket / Cobrar"
                : "Solicitar Cuenta / Checkout"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.addFloatButton}
          onPress={agregarComensal}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
          <Text style={styles.addText}>Nuevo Comensal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para nombres individuales */}
      <EditComensalModal
        visible={modalVisible}
        value={nombreTemporal}
        onChange={setNombreTemporal}
        onSave={guardarNombre}
        onClose={() => setModalVisible(false)}
      />

      {/* Modal para el conteo total de la mesa */}
      <UpdateDinersModal
        visible={modalDinersVisible}
        currentDiners={numComensalesMesa}
        onSave={(val) => {
          setNumComensalesMesa(val);
          setModalDinersVisible(false);
        }}
        onClose={() => setModalDinersVisible(false)}
      />

      <ConfirmActionModal
        visible={!!cancelInfo}
        title="¿Cancelar producto?"
        message={cancelInfo?.mensaje || ""}
        confirmText="Confirmar Cancelación"
        confirmColor={COLORS.error}
        icon="alert-circle"
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelInfo(null)}
      />

      <ConfirmActionModal
        visible={!!productToDeliver}
        title="¿Producto entregado?"
        message="¿Confirmas que este plato ya está en la mesa del cliente?"
        confirmText="Sí, entregar"
        confirmColor="#10B981"
        icon="checkmark-done-circle"
        onConfirm={handleDeliverConfirm}
        onCancel={() => setProductToDeliver(null)}
      />
      <OrderSettlementModal
        visible={isPaymentModalVisible}
        orderData={fullOrderData}
        onClose={() => setPaymentModalVisible(false)}
        onConfirm={handlePaymentConfirm}
        isLoading={isPreparingSettlement}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scroll: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: 100,
  },

  miniBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
  },
  addFloatButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.l,
    elevation: 6,
  },
  addText: {
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text.secondary,
    marginTop: SPACING.m,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.muted,
    textAlign: "center",
    marginTop: SPACING.s,
    lineHeight: 20,
  },
  headerLeftButton: {
    padding: 8,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
  },
  headerIconButton: {
    padding: 8,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dinersBadgeContainer: {
    position: "relative",
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  miniBadgeCount: {
    position: "absolute",
    top: -8,
    right: -10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 1,
  },
  checkoutBtn: {
    flexDirection: "row",
    backgroundColor: "#000000",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.xl,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkoutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 10,
  },
});

export default ComandaScreen;
