/*
  Warnings:

  - A unique constraint covering the columns `[publicToken]` on the table `Pedido` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN "adminSeenAt" DATETIME;
ALTER TABLE "Pedido" ADD COLUMN "confirmedEmailSentAt" DATETIME;
ALTER TABLE "Pedido" ADD COLUMN "customerEmailSentAt" DATETIME;
ALTER TABLE "Pedido" ADD COLUMN "publicToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_publicToken_key" ON "Pedido"("publicToken");
