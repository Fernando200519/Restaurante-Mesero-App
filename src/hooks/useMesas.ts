import { useEffect, useState, useCallback } from "react";
import { Mesa } from "../types/mesa";
import { fetchMesas } from "../api/mesasApi";

export const useMesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMesas();
      setMesas(data);
    } catch (e) {
      console.warn("Error fetchMesas", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // podrías abrir un socket aquí para real-time updates
  }, [load]);

  const refresh = () => load();

  return { mesas, setMesas, loading, refresh };
};
