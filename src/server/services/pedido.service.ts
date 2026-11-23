// Capa de negocio, módulo de pedidos (RF4 y RF6). Es el módulo con más reglas.
import type { EstadoPedido, MedioPago } from "@/generated/prisma/client";
import { pedidoRepository, type NuevoPedido } from "../repositories/pedido.repository";
import { productoRepository } from "../repositories/producto.repository";
import { tiendaRepository } from "../repositories/tienda.repository";
import { pagoService } from "./pago.service";
import { ErrorDeNegocio } from "./errores";

type Checkout = {
  compradorId: string;
  items: { productoId: string; cantidad: number }[];
  localidadEntregaId: number;
  direccion: string;
  medioPago: MedioPago;
};

/** Transiciones permitidas que puede hacer el emprendedor (Diagrama 10 del SAD). */
function transicionValida(actual: EstadoPedido, nuevo: EstadoPedido, medio: MedioPago) {
  if (nuevo === "ENVIADO") return actual === "PAGADO" || (actual === "PENDIENTE" && medio === "CONTRAENTREGA");
  if (nuevo === "ENTREGADO") return actual === "ENVIADO";
  return false;
}

/** Agrupa el carrito por tienda usando precios de la base de datos, nunca los del cliente. */
async function armarPedidos(c: Checkout): Promise<NuevoPedido[]> {
  const productos = await productoRepository.buscarVarios(c.items.map((i) => i.productoId));
  const porTienda = new Map<string, NuevoPedido>();
  for (const item of c.items) {
    const p = productos.find((x) => x.id === item.productoId);
    if (!p) throw new ErrorDeNegocio("Un producto del carrito ya no está disponible", 409);
    const pedido = porTienda.get(p.tiendaId) ?? {
      compradorId: c.compradorId, tiendaId: p.tiendaId, localidadEntregaId: c.localidadEntregaId,
      direccion: c.direccion, medioPago: c.medioPago, lineas: [],
    };
    pedido.lineas.push({ productoId: p.id, cantidad: item.cantidad, precioUnitario: p.precio });
    porTienda.set(p.tiendaId, pedido);
  }
  return [...porTienda.values()];
}

export const pedidoService = {
  /** Checkout: crea un pedido por tienda en estado PENDIENTE y descuenta el stock. */
  async crearDesdeCarrito(c: Checkout) {
    if (!pagoService.medioDisponible(c.medioPago)) throw new ErrorDeNegocio(`El medio de pago ${c.medioPago} no está disponible en el PMV`);
    const pedidos = await armarPedidos(c);
    try {
      return await pedidoRepository.crearConLineas(pedidos);
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("SIN_STOCK")) throw new ErrorDeNegocio("No hay stock suficiente de un producto", 409);
      throw e;
    }
  },

  /** Inicia el cobro de un pedido propio y pendiente usando PagoService. */
  async iniciarPago(pedidoId: string, compradorId: string) {
    const pedido = await pedidoRepository.buscarPorId(pedidoId);
    if (!pedido || pedido.compradorId !== compradorId) throw new ErrorDeNegocio("Pedido no encontrado", 404);
    if (pedido.estado !== "PENDIENTE") throw new ErrorDeNegocio("El pedido ya no está pendiente de pago", 409);
    const actual = await pagoService.pagoActual(pedido.id);
    if (actual?.estado === "PENDIENTE") throw new ErrorDeNegocio("El pedido ya tiene un pago en curso", 409);
    return pagoService.iniciar(pedido);
  },

  /** Lo llama la capa API después de confirmar un pago aprobado por webhook. */
  async marcarPagado(pedidoId: string) {
    const pedido = await pedidoRepository.buscarPorId(pedidoId);
    if (pedido?.estado === "PENDIENTE") await pedidoRepository.cambiarEstado(pedidoId, "PAGADO");
  },

  misPedidos(compradorId: string) {
    return pedidoRepository.listarPorComprador(compradorId);
  },

  async pedidosDeMiTienda(emprendedorId: string) {
    const tienda = await tiendaRepository.buscarPorEmprendedor(emprendedorId);
    if (!tienda) throw new ErrorDeNegocio("El emprendedor no tiene tienda", 404);
    return pedidoRepository.listarPorTienda(tienda.id);
  },

  async cambiarEstado(emprendedorId: string, pedidoId: string, nuevo: EstadoPedido) {
    const pedido = await pedidoRepository.buscarPorId(pedidoId);
    if (!pedido || pedido.tienda.emprendedorId !== emprendedorId) throw new ErrorDeNegocio("Pedido no encontrado", 404);
    if (!transicionValida(pedido.estado, nuevo, pedido.medioPago))
      throw new ErrorDeNegocio(`No se puede pasar de ${pedido.estado} a ${nuevo}`, 409);
    const actualizado = await pedidoRepository.cambiarEstado(pedidoId, nuevo);
    if (nuevo === "ENTREGADO") await pagoService.registrarCobroContraentrega(pedidoId);
    return actualizado;
  },
};
