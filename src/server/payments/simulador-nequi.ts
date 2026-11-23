// SIMULACIÓN de la API externa de Nequi para el PMV (no es parte de EmprendeTech).
// Tiene una API propia, distinta de PasarelaPago, que el NequiAdapter debe traducir.
// Guarda los cobros en memoria: sirve para una demo en un solo proceso.
import { randomUUID } from "crypto";

type CobroNequi = { id: string; valor: number; mensaje: string; status: "PENDING" | "SUCCESS" | "FAILED" };

const cobros = new Map<string, CobroNequi>();

export const apiNequiSimulada = {
  /** Equivale a "crear solicitud de pago push" en la API real. */
  async crearSolicitudPush(valor: number, mensaje: string): Promise<{ transactionId: string; status: "PENDING" }> {
    const id = `NEQ-${randomUUID()}`;
    cobros.set(id, { id, valor, mensaje, status: "PENDING" });
    return { transactionId: id, status: "PENDING" };
  },
  async consultar(transactionId: string): Promise<{ status: CobroNequi["status"] }> {
    return { status: cobros.get(transactionId)?.status ?? "PENDING" };
  },
  marcar(transactionId: string, status: "SUCCESS" | "FAILED") {
    const c = cobros.get(transactionId);
    if (c) c.status = status;
  },
};
