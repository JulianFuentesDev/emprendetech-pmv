// Firma HMAC del webhook: la pasarela firma el cuerpo con el secreto compartido.
import { createHmac, timingSafeEqual } from "crypto";

export function firmar(cuerpo: string) {
  return createHmac("sha256", process.env.WEBHOOK_SECRET ?? "").update(cuerpo).digest("hex");
}

export function firmaValida(cuerpo: string, firma: string | null) {
  if (!firma) return false;
  const esperada = Buffer.from(firmar(cuerpo));
  const recibida = Buffer.from(firma);
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}
