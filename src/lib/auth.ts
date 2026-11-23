// Capa transversal: autenticación con Auth.js (NextAuth) y control de acceso por rol.
// La sesión viaja en un token JWT, así la aplicación no guarda estado en memoria (RNF7).
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import type { Rol } from "@/generated/prisma/client";
import { usuarioService } from "@/server/services/usuario.service";
import { ErrorDeNegocio } from "@/server/services/errores";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Correo y contraseña",
      credentials: { email: { label: "Correo", type: "email" }, password: { label: "Contraseña", type: "password" } },
      async authorize(credenciales) {
        if (!credenciales?.email || !credenciales?.password) return null;
        const u = await usuarioService.verificarCredenciales(credenciales.email, credenciales.password);
        return u ? { id: u.id, name: u.nombre, email: u.email, rol: u.rol } : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = (user as unknown as { rol: Rol }).rol;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as Rol;
      }
      return session;
    },
  },
};

export type UsuarioSesion = { id: string; rol: Rol; nombre: string };

/** Devuelve el usuario de la sesión y exige uno de los roles indicados. */
export async function exigirRol(...roles: Rol[]): Promise<UsuarioSesion> {
  const sesion = await getServerSession(authOptions);
  if (!sesion?.user?.id) throw new ErrorDeNegocio("Debe iniciar sesión", 401);
  if (roles.length > 0 && !roles.includes(sesion.user.rol)) throw new ErrorDeNegocio("No tiene permiso para esta acción", 403);
  return { id: sesion.user.id, rol: sesion.user.rol, nombre: sesion.user.name ?? "" };
}
