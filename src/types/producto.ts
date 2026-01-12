export interface Complemento {
  id: number;
  nombre: string;
  precio: number;
}

export interface IngredienteOpcional {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoryId: number;
  precio: number;
  tipo: string;
  estado: string;
  imagen: string;
  complementos: Complemento[] | null;
  ingredientesOpcionales: IngredienteOpcional[] | null;
  esPersonalizable?: boolean;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: string;
  tipo: string | null;
  categoriaPadre?: string | null;
  subcategorias?: string[];
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
  opcionesSeleccionadas: any[]; // Antes: opciones
  comentario: string; // Antes: notas
  precioUnitario: number; // Antes: precioFinal
}
