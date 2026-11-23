import { checkoutSchema } from "@/lib/validacion";
import { exigirRol } from "@/lib/auth";
import { manejarError, ok } from "@/lib/http";
import { pedidoService } from "@/server/services/pedido.service";

export const dynamic = "force-dynamic";

/** POST solo COMPRADOR: checkout del carrito (RF4). */
export async function POST(req: Request) {
  try {
    const u = await exigirRol("COMPRADOR");
    const datos = checkoutSchema.parse(await req.json());
    const pedidos = await pedidoService.crearDesdeCarrito({ ...datos, compradorId: u.id });
    return ok(pedidos, 201);
  } catch (e) {
    return manejarError(e);
  }
}

/** GET: el comprador ve sus pedidos; el emprendedor, los de su tienda (RF6). */
export async function GET() {
  try {
    const u = await exigirRol("COMPRADOR", "EMPRENDEDOR");
    return ok(u.rol === "COMPRADOR" ? await pedidoService.misPedidos(u.id) : await pedidoService.pedidosDeMiTienda(u.id));
  } catch (e) {
    return manejarError(e);
  }
}
