import { busquedaSchema, productoSchema } from "@/lib/validacion";
import { exigirRol } from "@/lib/auth";
import { manejarError, ok } from "@/lib/http";
import { catalogoService } from "@/server/services/catalogo.service";

export const dynamic = "force-dynamic";

/** GET público: búsqueda con filtros (RF3). Con ?mios=1 el emprendedor lista los de su tienda. */
export async function GET(req: Request) {
  try {
    const params = Object.fromEntries(new URL(req.url).searchParams);
    if (params.mios === "1") {
      const u = await exigirRol("EMPRENDEDOR");
      return ok(await catalogoService.misProductos(u.id));
    }
    return ok(await catalogoService.buscar(busquedaSchema.parse(params)));
  } catch (e) {
    return manejarError(e);
  }
}

/** POST solo EMPRENDEDOR: crear producto (RF2). */
export async function POST(req: Request) {
  try {
    const u = await exigirRol("EMPRENDEDOR");
    return ok(await catalogoService.crear(u.id, productoSchema.parse(await req.json())), 201);
  } catch (e) {
    return manejarError(e);
  }
}
