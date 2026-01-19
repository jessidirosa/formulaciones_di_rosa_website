/*
  Warnings:

  - You are about to drop the `_ProductosCategorias` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Categoria_nombre_key";

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN "descripcionLarga" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ProductosCategorias";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ProductosCategorias" (
    "productoId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,

    PRIMARY KEY ("productoId", "categoriaId"),
    CONSTRAINT "ProductosCategorias_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductosCategorias_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
