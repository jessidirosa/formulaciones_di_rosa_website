/*
  Warnings:

  - You are about to drop the column `fechaEstimadaEntrega` on the `Pedido` table. All the data in the column will be lost.
  - Added the required column `costoEnvio` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descuento` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Pedido` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "usuarioId" INTEGER,
    "nombreCliente" TEXT NOT NULL,
    "apellidoCliente" TEXT,
    "dniCliente" TEXT,
    "emailCliente" TEXT NOT NULL,
    "telefonoCliente" TEXT,
    "fechaNacimiento" DATETIME,
    "direccion" TEXT,
    "ciudad" TEXT,
    "provincia" TEXT,
    "codigoPostal" TEXT,
    "tipoEntrega" TEXT NOT NULL,
    "subtotal" REAL NOT NULL,
    "costoEnvio" REAL NOT NULL,
    "descuento" REAL NOT NULL,
    "total" REAL NOT NULL,
    "fechaEstimadaEnvio" DATETIME,
    "notasCliente" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "estadoPago" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);
INSERT INTO "new_Pedido" ("actualizadoEn", "ciudad", "codigoPostal", "creadoEn", "direccion", "emailCliente", "estado", "id", "nombreCliente", "numero", "provincia", "telefonoCliente", "tipoEntrega", "total", "usuarioId") SELECT "actualizadoEn", "ciudad", "codigoPostal", "creadoEn", "direccion", "emailCliente", "estado", "id", "nombreCliente", "numero", "provincia", "telefonoCliente", "tipoEntrega", "total", "usuarioId" FROM "Pedido";
DROP TABLE "Pedido";
ALTER TABLE "new_Pedido" RENAME TO "Pedido";
CREATE UNIQUE INDEX "Pedido_numero_key" ON "Pedido"("numero");
CREATE TABLE "new_PedidoItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pedidoId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "categoriaProducto" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnitario" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    CONSTRAINT "PedidoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PedidoItem_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PedidoItem" ("cantidad", "id", "nombreProducto", "pedidoId", "precioUnitario", "productoId", "subtotal") SELECT "cantidad", "id", "nombreProducto", "pedidoId", "precioUnitario", "productoId", "subtotal" FROM "PedidoItem";
DROP TABLE "PedidoItem";
ALTER TABLE "new_PedidoItem" RENAME TO "PedidoItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
