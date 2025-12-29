import { useEffect, useState, useCallback } from "react";
import { Mesa } from "../types/mesa";
import { useAuth } from "../context/AuthContext";
import { mesasApi } from "../api/mesasApi";

export const useMesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchMesas = useCallback(
    async (background = false, manualToken?: string) => {
      const tokenToUse = manualToken || token;
      if (!tokenToUse) return;

      if (!background) setLoading(true);

      try {
        const data = await mesasApi.getMesas(tokenToUse);
        setMesas(data);
        setError(null);
      } catch (err: any) {
        if (!err.message.includes("Sesión expirada")) {
          setError("No se pudieron cargar las mesas");
          console.error("🔴 Error real en hook useMesas:", err.message);
        } else {
          console.log("🟡 Sesión expirada en hook, esperando rescate...");
        }
        throw err;
      } finally {
        if (!background) setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchMesas().catch(() => {});
  }, [fetchMesas]);

  return { mesas, loading, error, refresh: fetchMesas };
};
