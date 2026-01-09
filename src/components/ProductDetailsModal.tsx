import React, { useState, useEffect, useMemo, useRef } from "react";

import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";

import { COLORS, SPACING } from "../constants/theme";
import { Producto, Complemento, IngredienteOpcional } from "../types/producto";

interface OpcionSeleccionada {
  id: number;
  nombre: string;
  precio: number;
  tipo: "complemento" | "ingrediente";
}

interface Props {
  visible: boolean;
  producto: Producto | null;
  onClose: () => void;
  onAddToCart: (
    producto: Producto,
    opcionesSeleccionadas: OpcionSeleccionada[],
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
  const [selectedOptions, setSelectedOptions] = useState<OpcionSeleccionada[]>(
    []
  );
  const [nota, setNota] = useState("");

  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      setSelectedOptions([]);
      setNota("");
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
      }).start();
    }
  }, [visible, producto]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const precioFinal = useMemo(() => {
    if (!producto) return 0;
    const precioExtra = selectedOptions.reduce(
      (acc, opt) => acc + opt.precio,
      0
    );
    return producto.precio + precioExtra;
  }, [producto, selectedOptions]);

  const toggleOption = (
    item: Complemento | IngredienteOpcional,
    tipo: "complemento" | "ingrediente"
  ) => {
    setSelectedOptions((prev) => {
      const exists = prev.find((o) => o.id === item.id && o.tipo === tipo);
      if (exists) {
        return prev.filter((o) => o.id !== item.id || o.tipo !== tipo);
      }
      return [
        ...prev,
        {
          id: item.id,
          nombre: item.nombre,
          precio: "precio" in item ? item.precio : 0,
          tipo,
        },
      ];
    });
  };

  if (!producto) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      {/* Fondo con desenfoque: Ahora solo se desvanece */}
      <BlurView
        intensity={Platform.OS === "ios" ? 30 : 100}
        style={styles.absolute}
        tint="dark"
      >
        <Pressable style={styles.overlay} onPress={handleClose} />
      </BlurView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        {/* 3. HOJA ANIMADA: Solo esta sección se desliza */}
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Header Imagen con truco del hash */}
          <View style={styles.imageContainer}>
            <Image
              source={producto.imagen ? `${producto.imagen}#.jpg` : null}
              style={styles.productImage}
              contentFit="cover"
              transition={500}
            />
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerText}>
              <Text style={styles.title}>{producto.nombre}</Text>
              <Text style={styles.basePrice}>
                Precio base:{" "}
                <Text style={styles.priceValue}>
                  ${producto.precio.toFixed(2)}
                </Text>
              </Text>
            </View>

            <Text style={styles.description}>{producto.descripcion}</Text>

            {/* SECCIÓN: Complementos */}
            {producto.complementos && producto.complementos.length > 0 && (
              <View style={styles.groupContainer}>
                <Text style={styles.groupTitle}>
                  Complementos{" "}
                  <Text style={styles.groupSubtitle}>(Opcional)</Text>
                </Text>
                {producto.complementos.map((item) => {
                  const isSelected = selectedOptions.some(
                    (o) => o.id === item.id && o.tipo === "complemento"
                  );
                  return (
                    <TouchableOpacity
                      key={`comp-${item.id}`}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionSelected,
                      ]}
                      onPress={() => toggleOption(item, "complemento")}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionLeft}>
                        <Ionicons
                          name={isSelected ? "checkbox" : "square-outline"}
                          size={22}
                          color={
                            isSelected ? COLORS.primary : COLORS.text.muted
                          }
                        />
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {item.nombre}
                        </Text>
                      </View>
                      <Text style={styles.optionPrice}>
                        +${item.precio.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* SECCIÓN: Ingredientes Opcionales (Sin Costo Extra) */}
            {producto.ingredientesOpcionales &&
              producto.ingredientesOpcionales.length > 0 && (
                <View style={styles.groupContainer}>
                  <Text style={styles.groupTitle}>
                    Personalizar{" "}
                    <Text style={styles.groupSubtitle}>(Sin costo)</Text>
                  </Text>
                  <View style={styles.chipsContainer}>
                    {producto.ingredientesOpcionales.map((item) => {
                      const isSelected = selectedOptions.some(
                        (o) => o.id === item.id && o.tipo === "ingrediente"
                      );
                      return (
                        <TouchableOpacity
                          key={`ing-${item.id}`}
                          style={[
                            styles.chip,
                            isSelected && styles.chipSelected,
                          ]}
                          onPress={() => toggleOption(item, "ingrediente")}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color={COLORS.white}
                              style={{ marginRight: 4 }}
                            />
                          )}
                          <Text
                            style={[
                              styles.chipText,
                              isSelected && styles.chipTextSelected,
                            ]}
                          >
                            {item.nombre}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

            {/* Campo de Notas para Cocina */}
            <View style={styles.groupContainer}>
              <Text style={styles.groupTitle}>Notas para cocina</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Ej. Sin cebolla, salsa aparte..."
                placeholderTextColor={COLORS.text.muted}
                value={nota}
                onChangeText={setNota}
                multiline
                maxLength={100}
              />
            </View>
          </ScrollView>

          {/* Footer con color #FF8108 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: COLORS.primary }]}
              onPress={() =>
                onAddToCart(producto, selectedOptions, precioFinal, nota)
              }
              activeOpacity={0.9}
            >
              <Text style={styles.addBtnText}>Agregar al pedido</Text>
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>
                  ${precioFinal.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  absolute: { position: "absolute", top: 0, left: 0, bottom: 0, right: 0 },
  overlay: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: "85%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  imageContainer: { height: 200, position: "relative" },
  productImage: { width: "100%", height: "100%", resizeMode: "cover" },
  closeBtn: {
    position: "absolute",
    top: SPACING.m,
    right: SPACING.m,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 6,
  },
  content: { flex: 1, padding: SPACING.l },
  headerText: { marginBottom: SPACING.s },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text.primary },
  basePrice: { fontSize: 14, color: COLORS.text.secondary, marginTop: 4 },
  priceValue: { fontWeight: "700", color: COLORS.text.primary },
  description: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.l,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: SPACING.m,
  },
  groupSubtitle: {
    fontSize: 14,
    fontWeight: "normal",
    color: COLORS.text.muted,
  },

  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: { fontSize: 14, color: COLORS.text.secondary, fontWeight: "600" },
  chipTextSelected: { color: COLORS.white },
  noteInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.m,
    fontSize: 15,
    color: COLORS.text.primary,
    minHeight: 80,
    textAlignVertical: "top",
  },
  footer: {
    padding: SPACING.l,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: COLORS.white,
  },
  addBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: SPACING.l,
    borderRadius: 16,
  },
  addBtnText: { color: COLORS.white, fontSize: 18, fontWeight: "800" },
  priceBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  priceBadgeText: { color: COLORS.white, fontWeight: "800", fontSize: 16 },

  groupContainer: {
    marginBottom: SPACING.xl,
    paddingHorizontal: 4,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: SPACING.m,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  optionSelected: {
    backgroundColor: `${COLORS.primary}05`,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: "500",
  },
  optionTextSelected: {
    fontWeight: "700",
    color: COLORS.primary,
  },
  optionPrice: {
    fontSize: 15,
    color: COLORS.text.secondary,
    fontWeight: "600",
  },
});
