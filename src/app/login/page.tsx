"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await signIn("credentials", { email, password, redirect: false });
    if (r?.error) setError("Correo o contraseña incorrectos");
    else { router.push("/"); router.refresh(); }
  };
  return (
    <>
      <h1>Ingresar</h1>
      <form className="vertical" onSubmit={enviar}>
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button>Ingresar</button>
        {error && <p className="error">{error}</p>}
      </form>
      <p>Usuarios de prueba: emprendedor1@demo.co, comprador@demo.co (contraseña Demo1234).</p>
    </>
  );
}
