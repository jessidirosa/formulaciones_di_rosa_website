-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN "carrier" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "carrierService" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "labelUrl" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "shippedAt" DATETIME;
ALTER TABLE "Pedido" ADD COLUMN "sucursalId" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "sucursalNombre" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "trackingCode" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "trackingUrl" TEXT;
