// Capa de negocio, módulo de catálogo (RF2 y RF3).
import { productoRepository, type FiltrosProducto } from "../repositories/producto.repository";
import { tiendaRepository } from "../repositories/tienda.repository";
import { referenciaRepository } from "../repositories/referencia.repository";
import { ErrorDeNegocio } from "./errores";

type DatosProducto = { nombre: string; descripcion?: string; precio: number; stock: number; categoriaId: number; imagenUrl?: string };

async function tiendaDe(emprendedorId: string) {
  const tienda = await tiendaRepository.buscarPorEmprendedor(emprendedorId);
  if (!tienda) throw new ErrorDeNegocio("El emprendedor no tiene tienda", 404);
  return tienda;
}

/** Regla: un emprendedor solo modifica productos de su propia tienda. */
async function productoPropio(emprendedorId: string, productoId: string) {
  const tienda = await tiendaDe(emprendedorId);
  const producto = await productoRepository.buscarPorId(productoId);
  if (!producto || !producto.activo) throw new ErrorDeNegocio("Producto no encontrado", 404);
  if (producto.tiendaId !== tienda.id) throw new ErrorDeNegocio("El producto no pertenece a su tienda", 403);
  return producto;
}

export const catalogoService = {
  buscar(filtros: FiltrosProducto) {
    if (filtros.precioMin && filtros.precioMax && filtros.precioMin > filtros.precioMax)
      throw new ErrorDeNegocio("El precio mínimo no puede ser mayor que el máximo");
    return productoRepository.buscar(filtros);
  },
  async datosDeFiltro() {
    const [localidades, categorias] = await Promise.all([referenciaRepository.localidades(), referenciaRepository.categorias()]);
    return { localidades, categorias };
  },
  async misProductos(emprendedorId: string) {
    const tienda = await tiendaDe(emprendedorId);
    return { tienda, productos: await productoRepository.listarPorTienda(tienda.id) };
  },
  async crear(emprendedorId: string, d: DatosProducto) {
    const tienda = await tiendaDe(emprendedorId);
    return productoRepository.crear({ ...d, imagenUrl: d.imagenUrl || null, tiendaId: tienda.id });
  },
  async actualizar(emprendedorId: string, productoId: string, d: DatosProducto) {
    await productoPropio(emprendedorId, productoId);
    return productoRepository.actualizar(productoId, { ...d, imagenUrl: d.imagenUrl || null });
  },
  async eliminar(emprendedorId: string, productoId: string) {
    await productoPropio(emprendedorId, productoId);
    return productoRepository.desactivar(productoId);
  },
};
