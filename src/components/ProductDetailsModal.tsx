import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Tipos rápidos (puedes importarlos de tu archivo types)
interface Opcion {
  id: number;
  nombre: string;
  precio: number;
}
interface Grupo {
  id: string;
  titulo: string;
  opciones: Opcion[];
  min: number;
  max: number;
}
interface Product {
  id: number;
  nombre: string;
  precio: number;
  modificadores?: Grupo[];
}

interface Props {
  visible: boolean;
  producto: Product | null;
  onClose: () => void;
  onAddToCart: (
    producto: Product,
    opcionesSeleccionadas: Opcion[],
    precioFinal: number,
    notas: string
  ) => void;
}

export default function ProductDetailsModal({
  visible,
  producto,
  onClose,
  onAddToCart,
}: Props) {
  const [selectedOptions, setSelectedOptions] = useState<Opcion[]>([]);
  const [nota, setNota] = useState(""); // Por si quieres agregar notas de texto libre después

  // Limpiar estado al abrir
  useEffect(() => {
    if (visible) {
      setSelectedOptions([]);
      setNota("");
    }
  }, [visible, producto]);

  if (!producto) return null;

  // Calculamos precio dinámico
  const precioExtra = selectedOptions.reduce((acc, opt) => acc + opt.precio, 0);
  const precioFinal = producto.precio + precioExtra;

  const toggleOption = (opcion: Opcion, grupo: Grupo) => {
    // Verificamos si ya está seleccionada
    const isSelected = selectedOptions.find((o) => o.id === opcion.id);

    if (isSelected) {
      // Quitarla
      setSelectedOptions((prev) => prev.filter((o) => o.id !== opcion.id));
    } else {
      // Agregarla
      // Aquí podrías validar grupo.max (si es selección única, quitar las otras del mismo grupo)
      if (grupo.max === 1) {
        // Si es selección única (Radio), quitamos las otras de este grupo primero
        const otrosIdsDelGrupo = grupo.opciones.map((o) => o.id);
        const limpio = selectedOptions.filter(
          (o) => !otrosIdsDelGrupo.includes(o.id)
        );
        setSelectedOptions([...limpio, opcion]);
      } else {
        // Selección múltiple
        setSelectedOptions((prev) => [...prev, opcion]);
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{producto.nombre}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.basePrice}>
            Precio base: ${producto.precio.toFixed(2)}
          </Text>

          <View style={styles.divider} />

          <ScrollView style={styles.content}>
            {producto.modificadores?.map((grupo) => (
              <View key={grupo.id} style={styles.groupContainer}>
                <Text style={styles.groupTitle}>
                  {grupo.titulo}
                  {grupo.max > 1 && (
                    <Text style={styles.groupSubtitle}> (Elige varios)</Text>
                  )}
                </Text>

                {grupo.opciones.map((opcion) => {
                  const isSelected = selectedOptions.some(
                    (o) => o.id === opcion.id
                  );
                  return (
                    <TouchableOpacity
                      key={opcion.id}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionSelected,
                      ]}
                      onPress={() => toggleOption(opcion, grupo)}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons
                          name={
                            isSelected
                              ? grupo.max === 1
                                ? "radio-button-on"
                                : "checkbox"
                              : grupo.max === 1
                              ? "radio-button-off"
                              : "square-outline"
                          }
                          size={24}
                          color={isSelected ? "#FA9623" : "#CCC"}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {opcion.nombre}
                        </Text>
                      </View>
                      {opcion.precio > 0 && (
                        <Text style={styles.optionPrice}>
                          +${opcion.precio}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          {/* Footer con Botón Agregar */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() =>
                onAddToCart(producto, selectedOptions, precioFinal, nota)
              }
            >
              <Text style={styles.addBtnText}>
                Agregar • ${precioFinal.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "70%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#333" },
  closeBtn: { padding: 5, backgroundColor: "#F5F5F5", borderRadius: 20 },
  basePrice: { fontSize: 14, color: "#888" },
  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 15 },
  content: { flex: 1 },
  groupContainer: { marginBottom: 25 },
  groupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  groupSubtitle: { fontSize: 12, fontWeight: "normal", color: "#999" },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F9F9F9",
  },
  optionSelected: { backgroundColor: "#FFF8E1" }, // Fondo amarillito suave al seleccionar
  optionText: { marginLeft: 10, fontSize: 16, color: "#555" },
  optionTextSelected: { fontWeight: "bold", color: "#333" },
  optionPrice: { fontSize: 14, color: "#FA9623", fontWeight: "600" },
  footer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  addBtn: {
    backgroundColor: "#FA9623",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  addBtnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
