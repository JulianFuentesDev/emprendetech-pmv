// Patrón Adapter: traduce la interfaz común PasarelaPago a la API (simulada) de Nequi.
import type { EstadoPago } from "@/generated/prisma/client";
import type { PasarelaPago, ResultadoCobro, SolicitudCobro } from "../pasarela-pago";
import { apiNequiSimulada } from "../simulador-nequi";

const ESTADOS: Record<string, EstadoPago> = { PENDING: "PENDIENTE", SUCCESS: "APROBADO", FAILED: "RECHAZADO" };

export class NequiAdapter implements PasarelaPago {
  readonly medio = "NEQUI" as const;

  async cobrar(solicitud: SolicitudCobro): Promise<ResultadoCobro> {
    const r = await apiNequiSimulada.crearSolicitudPush(solicitud.monto, solicitud.descripcion);
    return {
      referenciaExterna: r.transactionId,
      estado: ESTADOS[r.status],
      urlPago: `/pago/simulador?ref=${encodeURIComponent(r.transactionId)}&monto=${solicitud.monto}`,
    };
  }

  async consultarEstado(referenciaExterna: string): Promise<EstadoPago> {
    const r = await apiNequiSimulada.consultar(referenciaExterna);
    return ESTADOS[r.status];
  }
}
