/*
  Warnings:

  - You are about to drop the column `metodoEnvio` on the `Pedido` table. All the data in the column will be lost.
  - Added the required column `tipoEntrega` to the `Pedido` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "usuarioId" INTEGER,
    "nombreCliente" TEXT NOT NULL,
    "emailCliente" TEXT NOT NULL,
    "telefonoCliente" TEXT,
    "tipoEntrega" TEXT NOT NULL,
    "direccion" TEXT,
    "ciudad" TEXT,
    "provincia" TEXT,
    "codigoPostal" TEXT,
    "total" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fechaEstimadaEntrega" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);
INSERT INTO "new_Pedido" ("actualizadoEn", "ciudad", "codigoPostal", "creadoEn", "direccion", "emailCliente", "estado", "fechaEstimadaEntrega", "id", "nombreCliente", "numero", "provincia", "telefonoCliente", "total", "usuarioId") SELECT "actualizadoEn", "ciudad", "codigoPostal", "creadoEn", "direccion", "emailCliente", "estado", "fechaEstimadaEntrega", "id", "nombreCliente", "numero", "provincia", "telefonoCliente", "total", "usuarioId" FROM "Pedido";
DROP TABLE "Pedido";
ALTER TABLE "new_Pedido" RENAME TO "Pedido";
CREATE UNIQUE INDEX "Pedido_numero_key" ON "Pedido"("numero");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
