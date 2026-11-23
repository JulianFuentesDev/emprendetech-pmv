"use client";
// Carrito y checkout (RF4) + inicio del pago (RF5).
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/components/api";
import { guardarCarrito, leerCarrito, pesos, type ItemCarrito } from "@/components/carrito";

type Ref = { id: number; nombre: string };
type Pedido = { id: string; total: number };
type Pago = { estado: string; urlPago?: string };

export default function Carrito() {
  const { data: sesion } = useSession();
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [localidades, setLocalidades] = useState<Ref[]>([]);
  const [f, setF] = useState({ localidadEntregaId: "", direccion: "", medioPago: "NEQUI" });
  const [resultado, setResultado] = useState<{ pedido: Pedido; pago: Pago }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(leerCarrito());
    api<{ localidades: Ref[] }>("/api/catalogo").then((r) => setLocalidades(r.localidades)).catch(() => {});
  }, []);
  const actualizar = (nuevos: ItemCarrito[]) => { setItems(nuevos); guardarCarrito(nuevos); };
  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);

  const pagar = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      const body = { items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })), localidadEntregaId: Number(f.localidadEntregaId), direccion: f.direccion, medioPago: f.medioPago };
      const pedidos = await api<Pedido[]>("/api/pedidos", { method: "POST", body: JSON.stringify(body) });
      const pagos = [];
      for (const pedido of pedidos) pagos.push({ pedido, pago: await api<Pago>("/api/pagos", { method: "POST", body: JSON.stringify({ pedidoId: pedido.id }) }) });
      setResultado(pagos); actualizar([]);
    } catch (err) { setError((err as Error).message); }
  };

  if (resultado.length > 0) return (
    <>
      <h1>Pedido creado</h1>
      <p>Se creó un pedido por cada tienda.</p>
      {resultado.map(({ pedido, pago }) => (
        <p key={pedido.id}>Pedido {pedido.id.slice(0, 8)} por {pesos(pedido.total)} · pago {pago.estado}
          {pago.urlPago && <> · <a href={pago.urlPago} target="_blank">Pagar con Nequi (simulado)</a></>}</p>
      ))}
      <a href="/mis-pedidos">Ver mis pedidos</a>
    </>
  );

  return (
    <>
      <h1>Carrito</h1>
      {items.length === 0 ? <p>El carrito está vacío.</p> : (
        <table>
          <thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr></thead>
          <tbody>{items.map((i, k) => (
            <tr key={i.productoId}><td>{i.nombre}</td><td>{pesos(i.precio)}</td>
              <td><input type="number" min={0} value={i.cantidad} style={{ width: 70 }}
                onChange={(e) => actualizar(items.map((x, j) => (j === k ? { ...x, cantidad: Number(e.target.value) } : x)).filter((x) => x.cantidad > 0))} /></td>
              <td>{pesos(i.precio * i.cantidad)}</td></tr>
          ))}</tbody>
        </table>
      )}
      <p><b>Total estimado: {pesos(total)}</b> (el servidor recalcula los precios)</p>
      {items.length > 0 && (sesion?.user?.rol === "COMPRADOR" ? (
        <form className="vertical" onSubmit={pagar}>
          <select value={f.localidadEntregaId} onChange={(e) => setF({ ...f, localidadEntregaId: e.target.value })} required>
            <option value="">Localidad de entrega</option>
            {localidades.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
          <input placeholder="Dirección de entrega" value={f.direccion} onChange={(e) => setF({ ...f, direccion: e.target.value })} required />
          <select value={f.medioPago} onChange={(e) => setF({ ...f, medioPago: e.target.value })}>
            <option value="NEQUI">Nequi (simulado)</option>
            <option value="CONTRAENTREGA">Efectivo contraentrega</option>
            <option value="DAVIPLATA" disabled>Daviplata (no disponible en el PMV)</option>
          </select>
          <button>Confirmar y pagar</button>
          {error && <p className="error">{error}</p>}
        </form>
      ) : <p>Para comprar, <a href="/login">ingrese como comprador</a>.</p>)}
    </>
  );
}
