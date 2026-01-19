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
INSERT INTO "new_Pedido" ("apellidoCliente", "ciudad", "codigoPostal", "costoEnvio", "createdAt", "direccion", "dniCliente", "emailCliente", "estado", "fechaEstimadaEnvio", "id", "metodoEnvio", "nombreCliente", "notasCliente", "numero", "provincia", "subtotal", "sucursalCorreo", "telefonoCliente", "tipoEntrega", "total", "updatedAt", "userId") SELECT "apellidoCliente", "ciudad", "codigoPostal", "costoEnvio", "createdAt", "direccion", "dniCliente", "emailCliente", "estado", "fechaEstimadaEnvio", "id", "metodoEnvio", "nombreCliente", "notasCliente", "numero", "provincia", "subtotal", "sucursalCorreo", "telefonoCliente", "tipoEntrega", "total", "updatedAt", "userId" FROM "Pedido";
DROP TABLE "Pedido";
ALTER TABLE "new_Pedido" RENAME TO "Pedido";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
