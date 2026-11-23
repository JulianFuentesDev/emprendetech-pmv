# EmprendeTech – PMV (Reto 4, Arquitectura de Software)

Producto mínimo viable de **EmprendeTech**, la tienda virtual para emprendedores locales de Bogotá.
Su objetivo es mostrar la arquitectura del SAD: un **monolito en capas** hecho con Next.js y
los patrones de diseño justificados en la sección 5.3. El código no es el centro de la evaluación.

Integrantes: Julián David Fuentes García y Julián Arley Ruiz González.

## Alcance del PMV

| RF | Qué hace el PMV |
|----|-----------------|
| RF1 | Registro e inicio de sesión con rol (emprendedor, comprador). El emprendedor crea su tienda al registrarse. |
| RF2 | El emprendedor crea, edita y elimina productos de su tienda. |
| RF3 | Búsqueda por texto y filtros por localidad, categoría y precio, con paginación. |
| RF4 | Carrito en el navegador y checkout. Se crea un pedido por cada tienda del carrito. |
| RF5 | Pago simulado con **Nequi** (con webhook) y **contraentrega**. |
| RF6 | Estados del pedido: pendiente, pagado, enviado y entregado. |

Fuera del PMV (diseñado en el SAD): Daviplata, tarjeta, reseñas (RF7), reportes (RF8) y subida de imágenes.

## Arquitectura: dónde está cada capa

Cada capa solo llama a la de abajo (sección 8.2 del SAD).

| Capa | Carpeta |
|------|---------|
| Presentación | `src/app` (páginas) y `src/components` |
| API | `src/app/api` (Route Handlers: validan datos, sesión y rol) |
| Negocio | `src/server/services` y `src/server/payments` |
| Datos | `src/server/repositories` y `src/lib/prisma.ts` |
| Transversal | `src/lib/auth.ts` y `src/middleware.ts` |

## Patrones de diseño: dónde está cada uno

| Patrón | Archivo | Qué resuelve |
|--------|---------|--------------|
| **Strategy** | `src/server/payments/pasarela-pago.ts` | La interfaz `PasarelaPago` define el cobro; cada medio de pago es una variante. |
| **Adapter** | `src/server/payments/adapters/nequi.adapter.ts`, `contraentrega.adapter.ts` | Traduce la API (simulada) de Nequi a la interfaz común. |
| **Factory** | `src/server/payments/pasarela-pago.factory.ts` | Elige el adaptador según el medio. Agregar una pasarela es registrar un adaptador. |
| **Repository** | `src/server/repositories/*.ts` | Los servicios no conocen Prisma ni SQL. |
| **Singleton** | `src/lib/prisma.ts` | Un solo cliente de base de datos por función para no agotar conexiones. |

`PagoService` (`src/server/services/pago.service.ts`) nunca conoce un adaptador concreto: le pide uno a la fábrica.
El webhook (`src/app/api/pagos/webhook/route.ts`) verifica una firma HMAC y es idempotente: si el aviso llega repetido, se ignora.

La regla `complexity` de ESLint está en 10 (RNF5). Se revisa con `npm run lint`.

## Cómo correrlo

Requisitos: Node.js 20.19 o superior y PostgreSQL (con Docker o una base gratis en Supabase).

```bash
npm install                 # también genera el cliente de Prisma
cp .env.example .env        # y ajuste DATABASE_URL si usa Supabase
docker compose up -d        # solo si usa PostgreSQL local con Docker
npx prisma db push          # crea las tablas
npx prisma db seed          # localidades, categorías, tiendas y productos de prueba
npm run dev                 # http://localhost:3000
```

Usuarios de prueba (contraseña `Demo1234`): `emprendedor1@demo.co`, `emprendedor2@demo.co`, `comprador@demo.co`.

## Demo sugerida (para el video)

1. Como comprador, filtrar productos por localidad y agregar dos productos de tiendas distintas al carrito.
2. Confirmar con Nequi: se crean dos pedidos, uno por tienda.
3. Abrir "Pagar con Nequi (simulado)" y aprobar. El simulador envía el webhook y el pedido pasa a **PAGADO**.
4. Como emprendedor, en "Pedidos", marcarlo como enviado y luego entregado.
5. Repetir con contraentrega: el pedido pasa de pendiente a enviado, y el pago se aprueba al entregar.

## Despliegue

Igual que en el SAD: la aplicación en **Vercel** y la base de datos en **Supabase**.
En Vercel se configuran las variables de `.env.example` (con `NEXTAUTH_URL` y `APP_URL` apuntando al dominio de Vercel).

Nota: el simulador de Nequi guarda los cobros en memoria. Sirve para la demo local; no es una pasarela real.
