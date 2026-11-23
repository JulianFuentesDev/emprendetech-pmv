"use client";
// Panel del emprendedor: pedidos de su tienda y cambio de estado (RF6).
import { useEffect, useState } from "react";
import { api } from "@/components/api";
import { pesos } from "@/components/carrito";

type Pedido = { id: string; estado: string; medioPago: string; total: number; direccion: string; comprador: { nombre: string }; localidadEntrega: { nombre: string }; lineas: { cantidad: number; producto: { nombre: string } }[] };

function siguiente(p: Pedido): "ENVIADO" | "ENTREGADO" | null {
  if (p.estado === "PAGADO" || (p.estado === "PENDIENTE" && p.medioPago === "CONTRAENTREGA")) return "ENVIADO";
  if (p.estado === "ENVIADO") return "ENTREGADO";
  return null;
}

export default function PedidosTienda() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [msg, setMsg] = useState("");
  const cargar = () => api<Pedido[]>("/api/pedidos").then(setPedidos).catch((e) => setMsg(e.message));
  useEffect(() => { cargar(); }, []);
  const avanzar = async (id: string, estado: string) => {
    try { await api(`/api/pedidos/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) }); cargar(); }
    catch (e) { setMsg((e as Error).message); }
  };
  return (
    <>
      <h1>Pedidos de mi tienda</h1>
      {msg && <p className="error">{msg}</p>}
      <table>
        <thead><tr><th>Comprador</th><th>Productos</th><th>Entrega</th><th>Total</th><th>Medio</th><th>Estado</th><th></th></tr></thead>
        <tbody>{pedidos.map((p) => {
          const sig = siguiente(p);
          return (
            <tr key={p.id}><td>{p.comprador.nombre}</td><td>{p.lineas.map((l) => `${l.cantidad} x ${l.producto.nombre}`).join(", ")}</td>
              <td>{p.localidadEntrega.nombre}, {p.direccion}</td><td>{pesos(p.total)}</td><td>{p.medioPago}</td><td><b>{p.estado}</b></td>
              <td>{sig && <button onClick={() => avanzar(p.id, sig)}>Marcar {sig.toLowerCase()}</button>}</td></tr>
          );
        })}</tbody>
      </table>
    </>
  );
}
