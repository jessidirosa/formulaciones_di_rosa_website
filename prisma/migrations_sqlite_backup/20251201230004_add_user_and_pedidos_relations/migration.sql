/*
  Warnings:

  - You are about to drop the column `actualizadoEn` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `apellidoCliente` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `ciudad` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `codigoPostal` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `descuento` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `dniCliente` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `emailCliente` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `estadoPago` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `fechaEstimadaEnvio` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `fechaNacimiento` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `mercadoPagoPreferenceId` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `nombreCliente` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `notasCliente` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `provincia` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `sucursalCorreo` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `telefonoCliente` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `tipoEntrega` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `Pedido` table. All the data in the column will be lost.
  - You are about to alter the column `costoEnvio` on the `Pedido` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `subtotal` on the `Pedido` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `total` on the `Pedido` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to drop the column `categoriaProducto` on the `PedidoItem` table. All the data in the column will be lost.
  - You are about to drop the column `precioUnitario` on the `PedidoItem` table. All the data in the column will be lost.
  - You are about to alter the column `subtotal` on the `PedidoItem` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "costoEnvio" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "metodoEnvio" TEXT NOT NULL DEFAULT 'desconocido',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    CONSTRAINT "Pedido_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pedido" ("costoEnvio", "estado", "id", "numero", "subtotal", "total") SELECT "costoEnvio", "estado", "id", "numero", "subtotal", "total" FROM "Pedido";
DROP TABLE "Pedido";
ALTER TABLE "new_Pedido" RENAME TO "Pedido";
CREATE UNIQUE INDEX "Pedido_numero_key" ON "Pedido"("numero");
CREATE TABLE "new_PedidoItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pedidoId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "nombreProducto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    CONSTRAINT "PedidoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PedidoItem_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PedidoItem" ("cantidad", "id", "nombreProducto", "pedidoId", "productoId", "subtotal") SELECT "cantidad", "id", "nombreProducto", "pedidoId", "productoId", "subtotal" FROM "PedidoItem";
DROP TABLE "PedidoItem";
ALTER TABLE "new_PedidoItem" RENAME TO "PedidoItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
