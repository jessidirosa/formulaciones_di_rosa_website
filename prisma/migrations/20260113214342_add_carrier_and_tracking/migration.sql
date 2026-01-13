/*
  Warnings:

  - You are about to drop the column `trackingCode` on the `Pedido` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "descuento" INTEGER NOT NULL DEFAULT 0,
    "costoEnvio" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "metodoEnvio" TEXT NOT NULL DEFAULT 'desconocido',
    "metodoPago" TEXT DEFAULT 'MERCADOPAGO',
    "expiresAt" DATETIME,
    "publicToken" TEXT,
    "transferProofStatus" TEXT,
    "transferProofNote" TEXT,
    "transferProofUrl" TEXT,
    "transferProofSentAt" DATETIME,
    "carrier" TEXT,
    "carrierService" TEXT,
    "sucursalId" TEXT,
    "sucursalNombre" TEXT,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "labelUrl" TEXT,
    "shippedAt" DATETIME,
    "adminSeenAt" DATETIME,
    "customerEmailSentAt" DATETIME,
    "confirmedEmailSentAt" DATETIME,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombreCliente" TEXT,
    "apellidoCliente" TEXT,
    "emailCliente" TEXT,
    "telefonoCliente" TEXT,
    "dniCliente" TEXT,
    "tipoEntrega" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "provincia" TEXT,
    "codigoPostal" TEXT,
    "sucursalCorreo" TEXT,
    "notasCliente" TEXT,
    "fechaEstimadaEnvio" DATETIME,
    CONSTRAINT "Pedido_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pedido" ("adminSeenAt", "apellidoCliente", "carrier", "carrierService", "ciudad", "codigoPostal", "confirmedEmailSentAt", "costoEnvio", "createdAt", "customerEmailSentAt", "descuento", "direccion", "dniCliente", "emailCliente", "estado", "expiresAt", "fechaEstimadaEnvio", "id", "labelUrl", "metodoEnvio", "metodoPago", "nombreCliente", "notasCliente", "numero", "provincia", "publicToken", "shippedAt", "subtotal", "sucursalCorreo", "sucursalId", "sucursalNombre", "telefonoCliente", "tipoEntrega", "total", "trackingUrl", "transferProofNote", "transferProofSentAt", "transferProofStatus", "transferProofUrl", "updatedAt", "userId") SELECT "adminSeenAt", "apellidoCliente", "carrier", "carrierService", "ciudad", "codigoPostal", "confirmedEmailSentAt", "costoEnvio", "createdAt", "customerEmailSentAt", "descuento", "direccion", "dniCliente", "emailCliente", "estado", "expiresAt", "fechaEstimadaEnvio", "id", "labelUrl", "metodoEnvio", "metodoPago", "nombreCliente", "notasCliente", "numero", "provincia", "publicToken", "shippedAt", "subtotal", "sucursalCorreo", "sucursalId", "sucursalNombre", "telefonoCliente", "tipoEntrega", "total", "trackingUrl", "transferProofNote", "transferProofSentAt", "transferProofStatus", "transferProofUrl", "updatedAt", "userId" FROM "Pedido";
DROP TABLE "Pedido";
ALTER TABLE "new_Pedido" RENAME TO "Pedido";
CREATE UNIQUE INDEX "Pedido_publicToken_key" ON "Pedido"("publicToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
