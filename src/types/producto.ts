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
  complementos: Complemento[];
  ingredientesOpcionales: IngredienteOpcional[];
  esPersonalizable?: boolean;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: string;
  tipo: string;
  categoriaPadreId?: number;
  categoriaPadre?: string;
  subcategorias?: string[] | Categoria[];
}
