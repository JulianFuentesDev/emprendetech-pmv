import type { EstadoPago, MedioPago } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const pagoRepository = {
  crear(data: { pedidoId: string; medio: MedioPago; monto: number; estado: EstadoPago; referenciaExterna: string }) {
    return prisma.pago.create({ data });
  },
  buscarPorReferencia(referenciaExterna: string) {
    return prisma.pago.findUnique({ where: { referenciaExterna } });
  },
  buscarUltimoDePedido(pedidoId: string) {
    return prisma.pago.findFirst({ where: { pedidoId }, orderBy: { creadoEn: "desc" } });
  },
  /**
   * Actualiza solo si el pago sigue PENDIENTE. Así el webhook es idempotente:
   * un aviso repetido no cambia nada (count = 0).
   */
  confirmarSiPendiente(referenciaExterna: string, estado: EstadoPago) {
    return prisma.pago.updateMany({ where: { referenciaExterna, estado: "PENDIENTE" }, data: { estado } });
  },
  cambiarEstado(id: string, estado: EstadoPago) {
    return prisma.pago.update({ where: { id }, data: { estado } });
  },
};
