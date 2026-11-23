// Utilidades de la capa API: convierte errores en respuestas HTTP con JSON.
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ErrorDeNegocio } from "@/server/services/errores";

export function ok(datos: unknown, status = 200) {
  return NextResponse.json(datos, { status });
}

export function manejarError(error: unknown) {
  if (error instanceof ErrorDeNegocio) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ error: "Datos inválidos", detalle: error.flatten() }, { status: 400 });
  console.error(error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
