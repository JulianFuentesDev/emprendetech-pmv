// Patrón Factory: elige el adaptador según el medio de pago.
// Agregar una pasarela nueva = escribir su adaptador y registrarlo aquí,
// sin tocar el checkout ni PagoService (RNF5).
import type { MedioPago } from "@/generated/prisma/client";
import type { PasarelaPago } from "./pasarela-pago";
import { NequiAdapter } from "./adapters/nequi.adapter";
import { ContraentregaAdapter } from "./adapters/contraentrega.adapter";
import { ErrorDeNegocio } from "../services/errores";

const registro: Partial<Record<MedioPago, () => PasarelaPago>> = {
  NEQUI: () => new NequiAdapter(),
  CONTRAENTREGA: () => new ContraentregaAdapter(),
  // DAVIPLATA y TARJETA están diseñados en el SAD pero no se implementan en el PMV.
};

export const PasarelaPagoFactory = {
  crear(medio: MedioPago): PasarelaPago {
    const fabricar = registro[medio];
    if (!fabricar) throw new ErrorDeNegocio(`El medio de pago ${medio} no está disponible en el PMV`, 400);
    return fabricar();
  },
  mediosDisponibles(): MedioPago[] {
    return Object.keys(registro) as MedioPago[];
  },
};
