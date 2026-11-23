"use client";
// Pantalla SIMULADA de Nequi. Representa al sistema externo, no a EmprendeTech.
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/components/api";
import { pesos } from "@/components/carrito";

function Simulador() {
  const params = useSearchParams();
  const referencia = params.get("ref") ?? "";
  const [msg, setMsg] = useState("");
  const responder = async (estado: "APROBADO" | "RECHAZADO") => {
    try {
      await api("/api/simulador-nequi", { method: "POST", body: JSON.stringify({ referencia, estado }) });
      setMsg(`Pago ${estado.toLowerCase()}. Nequi avisó a EmprendeTech por webhook.`);
    } catch (e) { setMsg((e as Error).message); }
  };
  return (
    <div className="tarjeta" style={{ maxWidth: 420 }}>
      <h1>Nequi (simulación)</h1>
      <p>Referencia: {referencia}</p>
      <p>Valor: <b>{pesos(Number(params.get("monto") ?? 0))}</b></p>
      <button onClick={() => responder("APROBADO")}>Aprobar pago</button>{" "}
      <button className="secundario" onClick={() => responder("RECHAZADO")}>Rechazar</button>
      {msg && <p className="exito">{msg}</p>}
    </div>
  );
}

export default function Pagina() {
  return <Suspense><Simulador /></Suspense>;
}
