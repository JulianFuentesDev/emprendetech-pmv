import type { EstadoPedido, MedioPago } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type NuevoPedido = {
  compradorId: string; tiendaId: string; localidadEntregaId: number; direccion: string; medioPago: MedioPago;
  lineas: { productoId: string; cantidad: number; precioUnitario: number }[];
};

const incluirDetalle = { lineas: { include: { producto: true } }, tienda: true, localidadEntrega: true, pagos: true } as const;

export const pedidoRepository = {
  /**
   * Crea los pedidos (uno por tienda) con sus líneas y descuenta el stock,
   * todo en una sola transacción. Si un producto no tiene stock, nada se guarda.
   */
  crearConLineas(pedidos: NuevoPedido[]) {
    return prisma.$transaction(async (tx) => {
      const creados = [];
      for (const p of pedidos) {
        for (const l of p.lineas) {
          const r = await tx.producto.updateMany({
            where: { id: l.productoId, stock: { gte: l.cantidad } },
            data: { stock: { decrement: l.cantidad } },
          });
          if (r.count === 0) throw new Error(`SIN_STOCK:${l.productoId}`);
        }
        const total = p.lineas.reduce((s, l) => s + l.precioUnitario * l.cantidad, 0);
        const { lineas, ...datos } = p;
        creados.push(await tx.pedido.create({ data: { ...datos, total, lineas: { create: lineas } } }));
      }
      return creados;
    });
  },
  buscarPorId(id: string) {
    return prisma.pedido.findUnique({ where: { id }, include: { tienda: true } });
  },
  listarPorComprador(compradorId: string) {
    return prisma.pedido.findMany({ where: { compradorId }, include: incluirDetalle, orderBy: { creadoEn: "desc" } });
  },
  listarPorTienda(tiendaId: string) {
    return prisma.pedido.findMany({
      where: { tiendaId },
      include: { ...incluirDetalle, comprador: { select: { nombre: true, email: true } } },
      orderBy: { creadoEn: "desc" },
    });
  },
  cambiarEstado(id: string, estado: EstadoPedido) {
    return prisma.pedido.update({ where: { id }, data: { estado } });
  },
};
