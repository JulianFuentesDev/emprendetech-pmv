// Datos de referencia para los filtros: localidades y categorías.
import { prisma } from "@/lib/prisma";

export const referenciaRepository = {
  localidades() {
    return prisma.localidad.findMany({ orderBy: { nombre: "asc" } });
  },
  categorias() {
    return prisma.categoria.findMany({ orderBy: { nombre: "asc" } });
  },
};
