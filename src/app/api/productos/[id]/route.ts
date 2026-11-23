import { productoSchema } from "@/lib/validacion";
import { exigirRol } from "@/lib/auth";
import { manejarError, ok } from "@/lib/http";
import { catalogoService } from "@/server/services/catalogo.service";

type Ctx = { params: { id: string } };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const u = await exigirRol("EMPRENDEDOR");
    return ok(await catalogoService.actualizar(u.id, params.id, productoSchema.parse(await req.json())));
  } catch (e) {
    return manejarError(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const u = await exigirRol("EMPRENDEDOR");
    await catalogoService.eliminar(u.id, params.id);
    return ok({ eliminado: true });
  } catch (e) {
    return manejarError(e);
  }
}
