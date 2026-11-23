"use client";
// Registro de comprador o emprendedor (RF1). El emprendedor crea su tienda al registrarse.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/components/api";

type Ref = { id: number; nombre: string };

export default function Registro() {
  const router = useRouter();
  const [localidades, setLocalidades] = useState<Ref[]>([]);
  const [f, setF] = useState({ nombre: "", email: "", password: "", rol: "COMPRADOR", nombreTienda: "", localidadId: "" });
  const [error, setError] = useState("");
  useEffect(() => { api<{ localidades: Ref[] }>("/api/catalogo").then((r) => setLocalidades(r.localidades)).catch(() => {}); }, []);
  const cambiar = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const datos = f.rol === "EMPRENDEDOR" ? { ...f, localidadId: Number(f.localidadId) } : { nombre: f.nombre, email: f.email, password: f.password, rol: f.rol };
    try { await api("/api/auth/registro", { method: "POST", body: JSON.stringify(datos) }); router.push("/login"); }
    catch (err) { setError((err as Error).message); }
  };
  return (
    <>
      <h1>Crear cuenta</h1>
      <form className="vertical" onSubmit={enviar}>
        <select value={f.rol} onChange={cambiar("rol")}>
          <option value="COMPRADOR">Quiero comprar</option>
          <option value="EMPRENDEDOR">Quiero vender (emprendedor)</option>
        </select>
        <input placeholder="Nombre" value={f.nombre} onChange={cambiar("nombre")} required />
        <input type="email" placeholder="Correo" value={f.email} onChange={cambiar("email")} required />
        <input type="password" placeholder="Contraseña (mínimo 8)" value={f.password} onChange={cambiar("password")} required />
        {f.rol === "EMPRENDEDOR" && (
          <>
            <input placeholder="Nombre de la tienda" value={f.nombreTienda} onChange={cambiar("nombreTienda")} required />
            <select value={f.localidadId} onChange={cambiar("localidadId")} required>
              <option value="">Localidad de la tienda</option>
              {localidades.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </select>
          </>
        )}
        <button>Registrarme</button>
        {error && <p className="error">{error}</p>}
      </form>
    </>
  );
}
