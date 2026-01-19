-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN "apellidoCliente" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "ciudad" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "codigoPostal" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "direccion" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "dniCliente" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "emailCliente" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "fechaEstimadaEnvio" DATETIME;
ALTER TABLE "Pedido" ADD COLUMN "nombreCliente" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "notasCliente" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "provincia" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "sucursalCorreo" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "telefonoCliente" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "tipoEntrega" TEXT;
