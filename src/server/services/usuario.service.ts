// Capa de negocio, módulo de usuarios (RF1). No conoce HTTP ni Prisma.
import bcrypt from "bcryptjs";
import type { Rol } from "@/generated/prisma/client";
import { usuarioRepository } from "../repositories/usuario.repository";
import { ErrorDeNegocio } from "./errores";

type Registro = { nombre: string; email: string; password: string; rol: Rol; nombreTienda?: string; localidadId?: number };

export const usuarioService = {
  async registrar(d: Registro) {
    const email = d.email.toLowerCase();
    if (await usuarioRepository.buscarPorEmail(email)) throw new ErrorDeNegocio("Ya existe una cuenta con ese correo", 409);
    if (d.rol === "EMPRENDEDOR" && (!d.nombreTienda || !d.localidadId))
      throw new ErrorDeNegocio("El emprendedor debe indicar el nombre y la localidad de su tienda");
    const passwordHash = await bcrypt.hash(d.password, 10);
    const tienda = d.rol === "EMPRENDEDOR" ? { nombre: d.nombreTienda!, localidadId: d.localidadId! } : undefined;
    return usuarioRepository.crear({ nombre: d.nombre, email, passwordHash, rol: d.rol, tienda });
  },

  async verificarCredenciales(email: string, password: string) {
    const u = await usuarioRepository.buscarPorEmail(email.toLowerCase());
    if (!u || !(await bcrypt.compare(password, u.passwordHash))) return null;
    return { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol };
  },
};
