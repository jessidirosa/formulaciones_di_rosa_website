-- CreateTable
CREATE TABLE "Pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "usuarioId" INTEGER,
    "nombreCliente" TEXT NOT NULL,
    "emailCliente" TEXT NOT NULL,
    "telefonoCliente" TEXT,
    "metodoEnvio" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "PedidoItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pedidoId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    CONSTRAINT "PedidoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PedidoItem_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numero_key" ON "Pedido"("numero");
