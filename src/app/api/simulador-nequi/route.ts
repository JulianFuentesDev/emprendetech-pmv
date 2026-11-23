// SIMULACIÓN del sistema externo de Nequi (solo para la demo del PMV).
// Cuando el comprador "aprueba" o "rechaza" en la pantalla simulada, Nequi
// envía el webhook firmado a EmprendeTech, igual que lo haría la pasarela real.
import { webhookSchema } from "@/lib/validacion";
import { firmar } from "@/lib/firma";
import { manejarError, ok } from "@/lib/http";
import { apiNequiSimulada } from "@/server/payments/simulador-nequi";

export async function POST(req: Request) {
  try {
    const { referencia, estado } = webhookSchema.parse(await req.json());
    apiNequiSimulada.marcar(referencia, estado === "APROBADO" ? "SUCCESS" : "FAILED");
    const cuerpo = JSON.stringify({ referencia, estado });
    const base = process.env.APP_URL ?? new URL(req.url).origin;
    const r = await fetch(`${base}/api/pagos/webhook`, { method: "POST", headers: { "content-type": "application/json", "x-firma": firmar(cuerpo) }, body: cuerpo });
    return ok({ webhookEnviado: r.ok });
  } catch (e) {
    return manejarError(e);
  }
}
