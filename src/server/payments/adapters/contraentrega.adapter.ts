// Patrón Adapter: contraentrega no llama a ninguna API externa.
// El pago queda PENDIENTE y se cobra en efectivo al entregar el pedido.
import { randomUUID } from "crypto";
import type { EstadoPago } from "@/generated/prisma/client";
import type { PasarelaPago, ResultadoCobro } from "../pasarela-pago";

export class ContraentregaAdapter implements PasarelaPago {
  readonly medio = "CONTRAENTREGA" as const;

  async cobrar(): Promise<ResultadoCobro> {
    return { referenciaExterna: `CE-${randomUUID()}`, estado: "PENDIENTE" };
  }

  async consultarEstado(): Promise<EstadoPago> {
    return "PENDIENTE";
  }
}
