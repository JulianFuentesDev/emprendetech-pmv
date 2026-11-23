import { estadoSchema } from "@/lib/validacion";
import { exigirRol } from "@/lib/auth";
import { manejarError, ok } from "@/lib/http";
import { pedidoService } from "@/server/services/pedido.service";

/** PATCH solo EMPRENDEDOR: cambiar el estado del pedido (RF6). */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const u = await exigirRol("EMPRENDEDOR");
    const { estado } = estadoSchema.parse(await req.json());
    return ok(await pedidoService.cambiarEstado(u.id, params.id, estado));
  } catch (e) {
    return manejarError(e);
  }
}
