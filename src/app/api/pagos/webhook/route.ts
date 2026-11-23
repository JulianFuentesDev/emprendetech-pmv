// Webhook de la pasarela (sin sesión). Se verifica con la firma HMAC del secreto compartido.
// Flujo del Diagrama 9: verificar → PagoService actualiza el pago → PedidoService marca PAGADO.
import { webhookSchema } from "@/lib/validacion";
import { firmaValida } from "@/lib/firma";
import { manejarError, ok } from "@/lib/http";
import { pagoService } from "@/server/services/pago.service";
import { pedidoService } from "@/server/services/pedido.service";

export async function POST(req: Request) {
  try {
    const cuerpo = await req.text();
    if (!firmaValida(cuerpo, req.headers.get("x-firma"))) return ok({ error: "Firma inválida" }, 401);
    const { referencia, estado } = webhookSchema.parse(JSON.parse(cuerpo));
    const r = await pagoService.confirmar(referencia, estado);
    if (r.procesado && r.aprobado) await pedidoService.marcarPagado(r.pedidoId);
    return ok({ recibido: true, procesado: r.procesado });
  } catch (e) {
    return manejarError(e);
  }
}
