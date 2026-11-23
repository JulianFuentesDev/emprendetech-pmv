import { prisma } from "@/lib/prisma";

export const tiendaRepository = {
  buscarPorEmprendedor(emprendedorId: string) {
    return prisma.tienda.findUnique({ where: { emprendedorId } });
  },
};
