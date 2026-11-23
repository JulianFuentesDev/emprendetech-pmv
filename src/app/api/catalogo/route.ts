import { manejarError, ok } from "@/lib/http";
import { catalogoService } from "@/server/services/catalogo.service";

export const dynamic = "force-dynamic";

/** Localidades y categorías para los filtros (público). */
export async function GET() {
  try {
    return ok(await catalogoService.datosDeFiltro());
  } catch (e) {
    return manejarError(e);
  }
}
