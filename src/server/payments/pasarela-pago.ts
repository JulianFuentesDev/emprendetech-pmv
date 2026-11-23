// Patrón Strategy: la interfaz PasarelaPago define la operación de cobro y cada medio
// de pago es una variante intercambiable. PagoService solo conoce esta interfaz.
import type { EstadoPago, MedioPago } from "@/generated/prisma/client";

export type SolicitudCobro = { pedidoId: string; monto: number; descripcion: string };

export type ResultadoCobro = {
  referenciaExterna: string;
  estado: EstadoPago;
  /** URL a la que se redirige al comprador para pagar (solo pagos en línea). */
  urlPago?: string;
};

export interface PasarelaPago {
  readonly medio: MedioPago;
  cobrar(solicitud: SolicitudCobro): Promise<ResultadoCobro>;
  consultarEstado(referenciaExterna: string): Promise<EstadoPago>;
}
