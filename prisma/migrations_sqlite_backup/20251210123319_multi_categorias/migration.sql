/*
  Warnings:

  - You are about to drop the column `categoria` on the `Producto` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Categoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductosCategorias" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ProductosCategorias_A_fkey" FOREIGN KEY ("A") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProductosCategorias_B_fkey" FOREIGN KEY ("B") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcionCorta" TEXT,
    "precio" REAL NOT NULL,
    "imagen" TEXT,
    "stock" INTEGER DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);
INSERT INTO "new_Producto" ("activo", "actualizadoEn", "creadoEn", "descripcionCorta", "destacado", "id", "imagen", "nombre", "orden", "precio", "slug", "stock") SELECT "activo", "actualizadoEn", "creadoEn", "descripcionCorta", "destacado", "id", "imagen", "nombre", "orden", "precio", "slug", "stock" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
CREATE UNIQUE INDEX "Producto_slug_key" ON "Producto"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductosCategorias_AB_unique" ON "_ProductosCategorias"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductosCategorias_B_index" ON "_ProductosCategorias"("B");
