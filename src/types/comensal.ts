export interface ComensalLocal {
  id: string | number; // ✅ Aceptamos ambos para evitar conflictos entre local y servidor
  nombre: string;
  total: number;
  itemsCount: number;
  items: any[];
}
