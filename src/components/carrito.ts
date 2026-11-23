// El carrito vive en el estado del navegador hasta el checkout (sección 8.2 del SAD).
export type ItemCarrito = { productoId: string; nombre: string; precio: number; cantidad: number };
const CLAVE = "emprendetech-carrito";

export function leerCarrito(): ItemCarrito[] {
  try { return JSON.parse(localStorage.getItem(CLAVE) ?? "[]"); } catch { return []; }
}
export function guardarCarrito(items: ItemCarrito[]) {
  try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch { /* sin almacenamiento */ }
}
export function agregarAlCarrito(p: { id: string; nombre: string; precio: number }) {
  const items = leerCarrito();
  const existente = items.find((i) => i.productoId === p.id);
  if (existente) existente.cantidad += 1;
  else items.push({ productoId: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1 });
  guardarCarrito(items);
}
export const pesos = (v: number) => "$" + v.toLocaleString("es-CO");
