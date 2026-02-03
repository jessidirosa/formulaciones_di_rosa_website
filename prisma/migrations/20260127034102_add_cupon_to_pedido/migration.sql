-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "cuponCodigo" TEXT,
ADD COLUMN     "cuponDescuento" DOUBLE PRECISION DEFAULT 0;
