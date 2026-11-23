// Capa transversal: protege las pantallas según el rol que viaja en el token.
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ req, token }) {
      if (!token) return false;
      if (req.nextUrl.pathname.startsWith("/panel")) return token.rol === "EMPRENDEDOR";
      return true;
    },
  },
});

export const config = { matcher: ["/panel/:path*", "/mis-pedidos"] };
