"use client";
// Panel del emprendedor: CRUD de productos de su tienda (RF2).
import { useEffect, useState } from "react";
import { api } from "@/components/api";
import { pesos } from "@/components/carrito";

type Ref = { id: number; nombre: string };
type Producto = { id: string; nombre: string; descripcion: string | null; precio: number; stock: number; categoriaId: number; categoria: Ref };
const vacio = { nombre: "", descripcion: "", precio: "", stock: "", categoriaId: "" };

export default function MisProductos() {
  const [categorias, setCategorias] = useState<Ref[]>([]);
  const [datos, setDatos] = useState<{ tienda: { nombre: string }; productos: Producto[] } | null>(null);
  const [f, setF] = useState(vacio);
  const [editando, setEditando] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const cargar = () => api<typeof datos>("/api/productos?mios=1").then(setDatos).catch((e) => setMsg(e.message));
  useEffect(() => { cargar(); api<{ categorias: Ref[] }>("/api/catalogo").then((r) => setCategorias(r.categorias)).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const cambiar = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({ ...f, precio: Number(f.precio), stock: Number(f.stock), categoriaId: Number(f.categoriaId) });
    try {
      await api(editando ? `/api/productos/${editando}` : "/api/productos", { method: editando ? "PUT" : "POST", body });
      setF(vacio); setEditando(null); setMsg("Producto guardado"); cargar();
    } catch (err) { setMsg((err as Error).message); }
  };
  const editar = (p: Producto) => { setEditando(p.id); setF({ nombre: p.nombre, descripcion: p.descripcion ?? "", precio: String(p.precio), stock: String(p.stock), categoriaId: String(p.categoriaId) }); };
  const eliminar = async (id: string) => { try { await api(`/api/productos/${id}`, { method: "DELETE" }); cargar(); } catch (e) { setMsg((e as Error).message); } };

  return (
    <>
      <h1>Productos de {datos?.tienda.nombre ?? "mi tienda"}</h1>
      <form className="panel" onSubmit={guardar}>
        <input placeholder="Nombre" value={f.nombre} onChange={cambiar("nombre")} required />
        <input placeholder="Descripción" value={f.descripcion} onChange={cambiar("descripcion")} />
        <input type="number" placeholder="Precio" value={f.precio} onChange={cambiar("precio")} required />
        <input type="number" placeholder="Stock" value={f.stock} onChange={cambiar("stock")} required />
        <select value={f.categoriaId} onChange={cambiar("categoriaId")} required>
          <option value="">Categoría</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <button>{editando ? "Guardar cambios" : "Publicar producto"}</button>
        {editando && <button type="button" className="secundario" onClick={() => { setEditando(null); setF(vacio); }}>Cancelar</button>}
      </form>
      {msg && <p>{msg}</p>}
      <table>
        <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th></th></tr></thead>
        <tbody>{datos?.productos.map((p) => (
          <tr key={p.id}><td>{p.nombre}</td><td>{p.categoria.nombre}</td><td>{pesos(p.precio)}</td><td>{p.stock}</td>
            <td><button onClick={() => editar(p)}>Editar</button>{" "}<button className="secundario" onClick={() => eliminar(p.id)}>Eliminar</button></td></tr>
        ))}</tbody>
      </table>
    </>
  );
}
