// Capa de negocio, módulo de pagos (RF5).
// PagoService nunca conoce un adaptador concreto: pide uno a la fábrica
// y lo usa a través de la interfaz PasarelaPago.
import type { EstadoPago, MedioPago } from "@/generated/prisma/client";
import { PasarelaPagoFactory } from "../payments/pasarela-pago.factory";
import { pagoRepository } from "../repositories/pago.repository";
import { ErrorDeNegocio } from "./errores";

export const pagoService = {
  /** Verifica que exista un adaptador para el medio antes de crear el pedido. */
  medioDisponible(medio: MedioPago) {
    return PasarelaPagoFactory.mediosDisponibles().includes(medio);
  },

  async iniciar(pedido: { id: string; total: number; medioPago: MedioPago }) {
    const pasarela = PasarelaPagoFactory.crear(pedido.medioPago);
    const resultado = await pasarela.cobrar({ pedidoId: pedido.id, monto: pedido.total, descripcion: `Pedido ${pedido.id.slice(0, 8)} EmprendeTech` });
    await pagoRepository.crear({ pedidoId: pedido.id, medio: pasarela.medio, monto: pedido.total, estado: resultado.estado, referenciaExterna: resultado.referenciaExterna });
    return resultado;
  },

  /**
   * Procesa el aviso de la pasarela (webhook). Es idempotente: si el pago ya no
   * está PENDIENTE, el aviso repetido se ignora.
   */
  async confirmar(referenciaExterna: string, estado: Exclude<EstadoPago, "PENDIENTE">) {
    const pago = await pagoRepository.buscarPorReferencia(referenciaExterna);
    if (!pago) throw new ErrorDeNegocio("Pago no encontrado", 404);
    const { count } = await pagoRepository.confirmarSiPendiente(referenciaExterna, estado);
    return { pedidoId: pago.pedidoId, aprobado: estado === "APROBADO", procesado: count === 1 };
  },

  async pagoActual(pedidoId: string) {
    return pagoRepository.buscarUltimoDePedido(pedidoId);
  },

  /** Contraentrega: el dinero se recibe al entregar, entonces el pago pasa a APROBADO. */
  async registrarCobroContraentrega(pedidoId: string) {
    const pago = await pagoRepository.buscarUltimoDePedido(pedidoId);
    if (pago && pago.medio === "CONTRAENTREGA" && pago.estado === "PENDIENTE") await pagoRepository.cambiarEstado(pago.id, "APROBADO");
  },
};
