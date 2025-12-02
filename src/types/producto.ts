// src/types/productos.ts

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string; // "Activa"
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoryId: number; // Esto conecta con la Categoria
  precio: number;
  tipo: string; // "Individual"
  estado: string; // "Activo"
  imagen: string | null;

  // Propiedades opcionales para lógica frontend (si las usas después)
  esPersonalizable?: boolean;
}
