import { useEffect, useState, useCallback } from "react";
import { Mesa } from "../types/mesa";
import { useAuth } from "../context/AuthContext"; // 👈 1. Importar useAuth
import { mesasApi } from "../api/mesasApi";

export const useMesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  // 👇 2. Obtener el token del contexto
  const { token } = useAuth();

  const fetchMesas = useCallback(async () => {
    // Si no hay token (ej. se cerró sesión), no intentamos cargar nada
    if (!token) return;

    setLoading(true);
    try {
      // 👇 3. Pasar el token a la API
      const data = await mesasApi.getMesas(token);
      setMesas(data);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar las mesas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]); // 👈 4. Agregar token a las dependencias

  useEffect(() => {
    fetchMesas();
  }, [fetchMesas]);

  return { mesas, loading, error, refresh: fetchMesas };
};
