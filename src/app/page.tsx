"use client";
// Tienda pública: catálogo con búsqueda y filtros por localidad, categoría y precio (RF3).
import { useEffect, useState } from "react";
import { api } from "@/components/api";
import { agregarAlCarrito, pesos } from "@/components/carrito";

type Ref = { id: number; nombre: string };
type Producto = { id: string; nombre: string; descripcion: string | null; precio: number; stock: number; categoria: Ref; tienda: { nombre: string; localidad: Ref } };

export default function Catalogo() {
  const [ref, setRef] = useState<{ localidades: Ref[]; categorias: Ref[] }>({ localidades: [], categorias: [] });
  const [filtros, setFiltros] = useState({ q: "", localidadId: "", categoriaId: "", precioMin: "", precioMax: "" });
  const [productos, setProductos] = useState<Producto[]>([]);
  const [msg, setMsg] = useState("");

  const buscar = async () => {
    const params = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v !== ""));
    try { setProductos(await api<Producto[]>(`/api/productos?${params}`)); setMsg(""); } catch (e) { setMsg((e as Error).message); }
  };
  useEffect(() => { api<typeof ref>("/api/catalogo").then(setRef).catch(() => {}); buscar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const cambiar = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFiltros({ ...filtros, [k]: e.target.value });

  return (
    <>
      <h1>Productos de emprendedores de Bogotá</h1>
      <form className="filtros" onSubmit={(e) => { e.preventDefault(); buscar(); }}>
        <input placeholder="Buscar" value={filtros.q} onChange={cambiar("q")} />
        <select value={filtros.localidadId} onChange={cambiar("localidadId")}>
          <option value="">Todas las localidades</option>
          {ref.localidades.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>
        <select value={filtros.categoriaId} onChange={cambiar("categoriaId")}>
          <option value="">Todas las categorías</option>
          {ref.categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <input type="number" placeholder="Precio mín." value={filtros.precioMin} onChange={cambiar("precioMin")} />
        <input type="number" placeholder="Precio máx." value={filtros.precioMax} onChange={cambiar("precioMax")} />
        <button>Buscar</button>
      </form>
      {msg && <p className={msg.includes("agregado") ? "exito" : "error"}>{msg}</p>}
      <div className="tarjetas">
        {productos.map((p) => (
          <div className="tarjeta" key={p.id}>
            <span className="etiqueta">{p.categoria.nombre}</span>
            <h3>{p.nombre}</h3>
            <p>{p.tienda.nombre} · {p.tienda.localidad.nombre}</p>
            <p><b>{pesos(p.precio)}</b> · {p.stock} disponibles</p>
            <button disabled={p.stock === 0} onClick={() => { agregarAlCarrito(p); setMsg(`${p.nombre} agregado al carrito`); }}>Agregar al carrito</button>
          </div>
        ))}
      </div>
      {productos.length === 0 && <p>No hay productos con esos filtros.</p>}
    </>
  );
}
