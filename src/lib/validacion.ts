// Esquemas de validación de la capa API (zod). La capa API valida y no aplica reglas de negocio.
import { z } from "zod";

export const registroSchema = z.object({
  nombre: z.string().min(2).max(120),
  email: z.string().email().max(160),
  password: z.string().min(8).max(72),
  rol: z.enum(["EMPRENDEDOR", "COMPRADOR"]),
  nombreTienda: z.string().min(2).max(120).optional(),
  localidadId: z.coerce.number().int().positive().optional(),
});

export const busquedaSchema = z.object({
  q: z.string().max(80).optional(),
  localidadId: z.coerce.number().int().positive().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  precioMin: z.coerce.number().int().min(0).optional(),
  precioMax: z.coerce.number().int().min(0).optional(),
  pagina: z.coerce.number().int().min(1).default(1),
});

export const productoSchema = z.object({
  nombre: z.string().min(2).max(120),
  descripcion: z.string().max(1000).optional(),
  precio: z.coerce.number().int().positive(),
  stock: z.coerce.number().int().min(0),
  categoriaId: z.coerce.number().int().positive(),
  imagenUrl: z.string().url().max(300).optional().or(z.literal("")),
});

export const checkoutSchema = z.object({
  items: z.array(z.object({ productoId: z.string().uuid(), cantidad: z.number().int().min(1).max(50) })).min(1),
  localidadEntregaId: z.number().int().positive(),
  direccion: z.string().min(5).max(200),
  medioPago: z.enum(["NEQUI", "DAVIPLATA", "TARJETA", "CONTRAENTREGA"]),
});

export const estadoSchema = z.object({ estado: z.enum(["ENVIADO", "ENTREGADO"]) });

export const webhookSchema = z.object({
  referencia: z.string().min(1).max(80),
  estado: z.enum(["APROBADO", "RECHAZADO"]),
});
