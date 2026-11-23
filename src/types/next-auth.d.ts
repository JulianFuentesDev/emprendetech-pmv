import type { Rol } from "@/generated/prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; rol: Rol; name?: string | null; email?: string | null };
  }
}
