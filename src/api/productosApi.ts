// src/api/productosApi.ts
import { Categoria, Producto } from "../types/producto";

const API_URL = "http://137.184.191.81";

export const productosApi = {
  getCategorias: async (token: string): Promise<Categoria[]> => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) throw new Error("Sesión expirada");

      if (!response.ok) throw new Error("Error fetching categories");

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Catch Categorías:", error);
      throw error;
    }
  },

  getProductos: async (token: string): Promise<Producto[]> => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) throw new Error("Sesión expirada");

      if (!response.ok) throw new Error("Error fetching products");

      const data = await response.json();

      if (data.productos && Array.isArray(data.productos)) {
        return data.productos;
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Catch Productos:", error);
      throw error;
    }
  },
};
