import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Alert,
  Animated, // 1. Importamos Animated
  Dimensions, // 👈 Asegúrate de que esto esté importado
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Mesa } from "../types/mesa"; // Asegúrate que la ruta sea correcta

interface Props {
  visible: boolean;
  mesa: Mesa | null;
  onClose: () => void;
  onConfirm: (mesaId: number, comensales: number) => Promise<void>;
}

// 👇 ESTA LÍNEA ES LA QUE TE FALTA PARA 'SCREEN_HEIGHT'
// Debes ponerla FUERA y ANTES de la función TableOpeningModal
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function TableOpeningModal({
  visible,
  mesa,
  onClose,
  onConfirm,
}: Props) {
  const [pax, setPax] = useState(2); // Por defecto sugerimos 2 personas
  const [loading, setLoading] = useState(false);

  // 2. Variable para la animación (empieza abajo, fuera de la pantalla)
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Cada vez que abrimos el modal o cambiamos de mesa, reseteamos el contador
  useEffect(() => {
    if (visible) {
      setPax(2);
      setLoading(false);
      // 3. Cuando se abre: Animamos hacia la posición 0 (subir)
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20, // Rebote suave
        stiffness: 90,
      }).start();
    } else {
      // Cuando se cierra: Reseteamos la posición hacia abajo
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, mesa]);

  if (!mesa) return null;

  const maxCapacidad = mesa.capacidad || 4; // Fallback por si no viene el dato
  const isMaxReached = pax >= maxCapacidad;
  const isMinReached = pax <= 1;

  const handleIncrement = () => {
    if (!isMaxReached) setPax(pax + 1);
    else
      Alert.alert(
        "Límite alcanzado",
        `Esta mesa es solo para ${maxCapacidad} personas.`
      );
  };

  const handleDecrement = () => {
    if (!isMinReached) setPax(pax - 1);
  };

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(parseInt(mesa.id), pax);
    // El loading se quita cuando el componente padre cierra el modal o navega
  };

  return (
    <Modal
      animationType="fade" // 4. EL FONDO AHORA HACE FADE (no se mueve)
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* 5. Usamos Animated.View en lugar de Pressable normal para la tarjeta */}
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] }, // Aplicamos la animación
          ]}
        >
          {/* Pressable vacío para atrapar los clicks y que no cierren el modal */}
          <Pressable style={{ width: "100%" }} onPress={() => {}}>
            {/* ❌ ELIMINADA LA RAYITA GRIS (dragHandle) AQUÍ */}

            {/* Encabezado */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{mesa.nombre}</Text>
                <Text style={styles.subtitle}>
                  Zona: {mesa.zona || "General"} • Capacidad: {maxCapacidad}
                </Text>
              </View>
              {/* Botón de Cerrar (Tachita) - Este es el rey ahora */}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Control de Comensales */}
            <View style={styles.paxContainer}>
              <Text style={styles.label}>¿Cuántas personas?</Text>

              <View style={styles.counterRow}>
                <TouchableOpacity
                  onPress={handleDecrement}
                  style={[
                    styles.counterBtn,
                    isMinReached && styles.counterBtnDisabled,
                  ]}
                  disabled={isMinReached}
                >
                  <Ionicons
                    name="remove"
                    size={32}
                    color={isMinReached ? "#CCC" : "#555"}
                  />
                </TouchableOpacity>

                <View style={styles.numberContainer}>
                  <Text
                    style={[
                      styles.paxNumber,
                      isMaxReached && styles.paxNumberLimit,
                    ]}
                  >
                    {pax}
                  </Text>
                  <Text style={styles.paxLabel}>personas</Text>
                </View>

                <TouchableOpacity
                  onPress={handleIncrement}
                  style={[
                    styles.counterBtn,
                    isMaxReached && styles.counterBtnDisabled,
                  ]}
                  disabled={isMaxReached}
                >
                  <Ionicons
                    name="add"
                    size={32}
                    color={isMaxReached ? "#CCC" : "#555"}
                  />
                </TouchableOpacity>
              </View>

              {isMaxReached && (
                <Text style={styles.limitWarning}>
                  ¡Capacidad máxima alcanzada!
                </Text>
              )}
            </View>

            {/* Botón de Acción */}
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <Text style={styles.confirmBtnText}>Abriendo mesa...</Text>
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#FFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.confirmBtnText}>Ocupar Mesa</Text>
                </>
              )}
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // El fondo oscuro
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    width: "100%",
    // Sombra para darle profundidad sobre el fondo oscuro
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  // dragHandle ELIMINADO de los estilos también

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10, // Un poquito de margen extra ahora que no hay rayita
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 50,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 20,
  },
  paxContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  counterBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  counterBtnDisabled: {
    opacity: 0.5,
    backgroundColor: "#FAFAFA",
  },
  numberContainer: {
    alignItems: "center",
  },
  paxNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: "#1A1A1A",
    lineHeight: 56,
  },
  paxNumberLimit: {
    color: "#FA9623",
  },
  paxLabel: {
    fontSize: 14,
    color: "#999",
  },
  limitWarning: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 10,
    fontWeight: "600",
  },
  confirmBtn: {
    backgroundColor: "#FA9623",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FA9623",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
