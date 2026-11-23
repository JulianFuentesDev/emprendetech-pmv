// Patrón Repository: solo esta capa conoce Prisma y SQL.
import type { Rol } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const usuarioRepository = {
  buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },
  /** Crea el usuario y, si es emprendedor, su tienda en la misma transacción. */
  crear(datos: { nombre: string; email: string; passwordHash: string; rol: Rol; tienda?: { nombre: string; localidadId: number } }) {
    const { tienda, ...usuario } = datos;
    return prisma.usuario.create({
      data: { ...usuario, tienda: tienda ? { create: tienda } : undefined },
      select: { id: true, nombre: true, email: true, rol: true },
    });
  },
};
