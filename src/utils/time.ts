export const calcularHaceCuanto = (fechaIso?: string | null) => {
  if (!fechaIso) return "--:--";

  try {
    const fechaLimpia = fechaIso
      .replace(/(\.\d{3})\d+/, "$1")
      .replace(/\+\d{2}:\d{2}$/, "Z");

    const inicio = new Date(fechaLimpia);
    const ahora = new Date();

    if (isNaN(inicio.getTime())) return "0 min";

    const diffMs = ahora.getTime() - inicio.getTime();
    const totalMinutos = Math.floor(diffMs / 60000);

    if (totalMinutos <= 0) return "1 min";
    if (totalMinutos < 60) return `${totalMinutos} min`;

    const horas = Math.floor(totalMinutos / 60);
    const minsRestantes = totalMinutos % 60;
    return `${horas}h ${minsRestantes}m`;
  } catch (error) {
    return "0 min";
  }
};
