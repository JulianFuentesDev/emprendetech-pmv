import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type FiltrosProducto = {
  q?: string; localidadId?: number; categoriaId?: number; precioMin?: number; precioMax?: number; pagina: number;
};

const TAM_PAGINA = 20;

function construirFiltro(f: FiltrosProducto): Prisma.ProductoWhereInput {
  return {
    activo: true,
    categoriaId: f.categoriaId,
    precio: { gte: f.precioMin, lte: f.precioMax },
    tienda: f.localidadId ? { localidadId: f.localidadId } : undefined,
    OR: f.q
      ? [{ nombre: { contains: f.q, mode: "insensitive" } }, { descripcion: { contains: f.q, mode: "insensitive" } }]
      : undefined,
  };
}

export const productoRepository = {
  /** Búsqueda con filtros y paginación (RF3, RNF3). Usa los índices por categoría, precio y localidad. */
  buscar(f: FiltrosProducto) {
    return prisma.producto.findMany({
      where: construirFiltro(f),
      include: { categoria: true, tienda: { include: { localidad: true } } },
      orderBy: { creadoEn: "desc" },
      skip: (f.pagina - 1) * TAM_PAGINA,
      take: TAM_PAGINA,
    });
  },
  listarPorTienda(tiendaId: string) {
    return prisma.producto.findMany({ where: { tiendaId, activo: true }, include: { categoria: true }, orderBy: { creadoEn: "desc" } });
  },
  buscarPorId(id: string) {
    return prisma.producto.findUnique({ where: { id } });
  },
  buscarVarios(ids: string[]) {
    return prisma.producto.findMany({ where: { id: { in: ids }, activo: true } });
  },
  crear(data: Prisma.ProductoUncheckedCreateInput) {
    return prisma.producto.create({ data });
  },
  actualizar(id: string, data: Prisma.ProductoUncheckedUpdateInput) {
    return prisma.producto.update({ where: { id }, data });
  },
  /** Borrado lógico: el producto puede estar en pedidos anteriores. */
  desactivar(id: string) {
    return prisma.producto.update({ where: { id }, data: { activo: false } });
  },
};
