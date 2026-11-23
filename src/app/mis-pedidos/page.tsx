"use client";
// El comprador consulta sus pedidos y el estado del pago (RF6).
import { useEffect, useState } from "react";
import { api } from "@/components/api";
import { pesos } from "@/components/carrito";

type Pedido = { id: string; estado: string; medioPago: string; total: number; creadoEn: string; tienda: { nombre: string }; pagos: { estado: string }[]; lineas: { cantidad: number; producto: { nombre: string } }[] };

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api<Pedido[]>("/api/pedidos").then(setPedidos).catch((e) => setError(e.message)); }, []);
  return (
    <>
      <h1>Mis pedidos</h1>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Fecha</th><th>Tienda</th><th>Productos</th><th>Total</th><th>Medio</th><th>Pago</th><th>Estado</th></tr></thead>
        <tbody>{pedidos.map((p) => (
          <tr key={p.id}>
            <td>{new Date(p.creadoEn).toLocaleString("es-CO")}</td><td>{p.tienda.nombre}</td>
            <td>{p.lineas.map((l) => `${l.cantidad} x ${l.producto.nombre}`).join(", ")}</td>
            <td>{pesos(p.total)}</td><td>{p.medioPago}</td><td>{p.pagos.at(-1)?.estado ?? "-"}</td><td><b>{p.estado}</b></td>
          </tr>
        ))}</tbody>
      </table>
    </>
  );
}
