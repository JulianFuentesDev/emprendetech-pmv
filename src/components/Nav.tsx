"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Nav() {
  const { data } = useSession();
  const rol = data?.user?.rol;
  return (
    <header>
      <Link href="/" className="marca">EmprendeTech</Link>
      <Link href="/">Catálogo</Link>
      {rol !== "EMPRENDEDOR" && <Link href="/carrito">Carrito</Link>}
      {rol === "COMPRADOR" && <Link href="/mis-pedidos">Mis pedidos</Link>}
      {rol === "EMPRENDEDOR" && <><Link href="/panel/productos">Mis productos</Link><Link href="/panel/pedidos">Pedidos</Link></>}
      {data ? (
        <button className="secundario" onClick={() => signOut({ callbackUrl: "/" })}>Salir ({data.user.name})</button>
      ) : (
        <><Link href="/login">Ingresar</Link><Link href="/registro">Registrarse</Link></>
      )}
    </header>
  );
}
