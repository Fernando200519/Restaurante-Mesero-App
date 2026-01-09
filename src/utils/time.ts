export const calcularHaceCuanto = (fechaIso?: string | null) => {
  if (!fechaIso) return "--:--";
  const fechaAjustada = fechaIso.endsWith("Z") ? fechaIso : fechaIso + "Z";
  const inicio = new Date(fechaAjustada);
  const ahora = new Date();
  const diff = ahora.getTime() - inicio.getTime();

  if (diff < 0) return "0 min";

  const minutos = Math.floor(diff / 60000);
  if (minutos < 60) return `${minutos} min`;

  const horas = Math.floor(minutos / 60);
  return `${horas}h ${minutos % 60}m`;
};
