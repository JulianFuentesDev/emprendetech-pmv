// La capa de presentación solo habla con la capa API por HTTP (REST + JSON).
export async function api<T = unknown>(url: string, opciones?: RequestInit): Promise<T> {
  const r = await fetch(url, { ...opciones, headers: { "content-type": "application/json", ...opciones?.headers } });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error ?? "Error inesperado");
  return datos as T;
}
