import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Rol } from "../src/generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const LOCALIDADES = [
  "Usaquén", "Chapinero", "Santa Fe", "San Cristóbal", "Usme", "Tunjuelito", "Bosa",
  "Kennedy", "Fontibón", "Engativá", "Suba", "Barrios Unidos", "Teusaquillo", "Los Mártires",
  "Antonio Nariño", "Puente Aranda", "La Candelaria", "Rafael Uribe Uribe", "Ciudad Bolívar", "Sumapaz",
];
const CATEGORIAS = ["Alimentos", "Ropa y accesorios", "Artesanías", "Belleza", "Hogar"];

async function usuario(nombre: string, email: string, rol: Rol) {
  const passwordHash = await bcrypt.hash("Demo1234", 10);
  return prisma.usuario.upsert({ where: { email }, update: {}, create: { nombre, email, rol, passwordHash } });
}

async function main() {
  for (const nombre of LOCALIDADES) await prisma.localidad.upsert({ where: { nombre }, update: {}, create: { nombre } });
  for (const nombre of CATEGORIAS) await prisma.categoria.upsert({ where: { nombre }, update: {}, create: { nombre } });
  const loc = async (n: string) => (await prisma.localidad.findUniqueOrThrow({ where: { nombre: n } })).id;
  const cat = async (n: string) => (await prisma.categoria.findUniqueOrThrow({ where: { nombre: n } })).id;

  const e1 = await usuario("Marta Rodríguez", "emprendedor1@demo.co", Rol.EMPRENDEDOR);
  const e2 = await usuario("Luis Cárdenas", "emprendedor2@demo.co", Rol.EMPRENDEDOR);
  await usuario("Ana Comprador", "comprador@demo.co", Rol.COMPRADOR);
  await usuario("Admin Cámara", "admin@demo.co", Rol.ADMIN);

  const t1 = await prisma.tienda.upsert({
    where: { emprendedorId: e1.id }, update: {},
    create: { emprendedorId: e1.id, nombre: "Café de la Sabana", localidadId: await loc("Chapinero"), descripcion: "Café de origen y panadería" },
  });
  const t2 = await prisma.tienda.upsert({
    where: { emprendedorId: e2.id }, update: {},
    create: { emprendedorId: e2.id, nombre: "Artesanías Bosa", localidadId: await loc("Bosa"), descripcion: "Tejidos y cerámica hechos a mano" },
  });

  if ((await prisma.producto.count()) === 0) {
    const productos = [
      { tiendaId: t1.id, categoriaId: await cat("Alimentos"), nombre: "Café de origen 500 g", precio: 32000, stock: 40 },
      { tiendaId: t1.id, categoriaId: await cat("Alimentos"), nombre: "Almojábanas x6", precio: 9000, stock: 25 },
      { tiendaId: t1.id, categoriaId: await cat("Hogar"), nombre: "Prensa francesa", precio: 68000, stock: 8 },
      { tiendaId: t2.id, categoriaId: await cat("Artesanías"), nombre: "Mochila tejida", precio: 85000, stock: 10 },
      { tiendaId: t2.id, categoriaId: await cat("Artesanías"), nombre: "Taza de cerámica", precio: 25000, stock: 30 },
      { tiendaId: t2.id, categoriaId: await cat("Ropa y accesorios"), nombre: "Ruana de lana", precio: 120000, stock: 5 },
    ];
    await prisma.producto.createMany({ data: productos.map((p) => ({ ...p, descripcion: `${p.nombre} de emprendedores locales` })) });
  }
  console.log("Datos de prueba listos. Contraseña de todos los usuarios: Demo1234");
}

main().finally(() => prisma.$disconnect());
