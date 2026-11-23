// Capa API: valida datos y llama al servicio. No contiene reglas de negocio.
import { registroSchema } from "@/lib/validacion";
import { manejarError, ok } from "@/lib/http";
import { usuarioService } from "@/server/services/usuario.service";

export async function POST(req: Request) {
  try {
    const datos = registroSchema.parse(await req.json());
    return ok(await usuarioService.registrar(datos), 201);
  } catch (e) {
    return manejarError(e);
  }
}
