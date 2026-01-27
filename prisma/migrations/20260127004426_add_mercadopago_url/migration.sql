/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "localidad" TEXT,
ADD COLUMN     "mercadopagoUrl" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "apellido" TEXT,
ADD COLUMN     "nombre" TEXT,
ADD COLUMN     "telefono" TEXT;

-- CreateTable
CREATE TABLE "Presentacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "productoId" INTEGER NOT NULL,

    CONSTRAINT "Presentacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Presentacion" ADD CONSTRAINT "Presentacion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
