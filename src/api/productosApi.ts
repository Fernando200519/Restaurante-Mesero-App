// src/api/productosApi.ts
import { Categoria, Producto } from "../types/producto";

const API_URL = "http://137.184.191.81";

export const productosApi = {
  // 1. Obtener Categorías
  getCategorias: async (token: string): Promise<Categoria[]> => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        // Ajusta si la ruta es distinta
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al cargar categorías");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // 2. Obtener Productos
  getProductos: async (token: string): Promise<Producto[]> => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        // Ajusta si la ruta es distinta
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al cargar productos");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },
};
