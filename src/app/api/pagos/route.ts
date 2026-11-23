import { z } from "zod";
import { exigirRol } from "@/lib/auth";
import { manejarError, ok } from "@/lib/http";
import { pedidoService } from "@/server/services/pedido.service";

/** POST solo COMPRADOR: inicia el pago de un pedido con el medio elegido en el checkout (RF5). */
export async function POST(req: Request) {
  try {
    const u = await exigirRol("COMPRADOR");
    const { pedidoId } = z.object({ pedidoId: z.string().uuid() }).parse(await req.json());
    return ok(await pedidoService.iniciarPago(pedidoId, u.id), 201);
  } catch (e) {
    return manejarError(e);
  }
}
