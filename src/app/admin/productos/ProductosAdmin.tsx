"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"


interface Categoria {
    id: number
    nombre: string
    slug: string
}

interface ProductoCategoriaPivot {
    categoria: Categoria
}

interface Producto {
    id: number
    nombre: string
    slug: string
    precio: number
    categoria: string | null
    descripcionCorta: string | null
    descripcionLarga?: string | null
    imagen: string | null
    stock: number | null
    activo: boolean
    destacado: boolean
    creadoEn?: string
    categorias?: ProductoCategoriaPivot[]  // 👈 acá
}


export default function ProductosAdmin() {
    const [productos, setProductos] = useState<Producto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)

    // Formulario de nuevo producto
    const [form, setForm] = useState({
        nombre: "",
        slug: "",
        precio: "",
        categoria: "",
        descripcionCorta: "",
        descripcionLarga: "",
        stock: "",
        categoriaIds: [] as number[],   // ✅ NUEVO
    })


    // Ajuste masivo de precios
    const [porcentaje, setPorcentaje] = useState("")
    const [monto, setMonto] = useState("")
    const [loadingMasivo, setLoadingMasivo] = useState(false)

    // Edición de producto
    const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
    const [editForm, setEditForm] = useState({
        nombre: "",
        precio: "",
        stock: "",
        descripcionCorta: "",
        descripcionLarga: "",
        categoria: "",
        categoriaIds: [] as number[],
    })
    const [savingEdit, setSavingEdit] = useState(false)

    useEffect(() => {
        fetchProductos()
        fetchCategorias()
    }, [])

    async function fetchProductos() {
        try {
            setLoading(true)
            const res = await fetch("/api/admin/productos", {
                credentials: "include",
            })

            if (!res.ok) {
                throw new Error("No se pudieron cargar los productos")
            }

            const data = await res.json()
            setProductos(data.productos || [])
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar productos")
        } finally {
            setLoading(false)
        }
    }

    async function fetchCategorias() {
        try {
            const res = await fetch("/api/admin/categorias", {
                credentials: "include",
            })

            if (!res.ok) return

            const data = await res.json()
            setCategorias(data.categorias || [])
        } catch (error) {
            console.error(error)
        }
    }

    const handleChangeForm = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.nombre || !form.precio) {
            toast.error("Nombre y precio son obligatorios")
            return
        }

        try {
            const res = await fetch("/api/admin/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    nombre: form.nombre,
                    slug: form.slug || undefined,
                    precio: Number(form.precio),
                    categoria: form.categoria || undefined,
                    descripcionCorta: form.descripcionCorta || undefined,
                    descripcionLarga: form.descripcionLarga || undefined,
                    stock: form.stock !== "" ? Number(form.stock) : undefined,
                    categoriaIds: form.categoriaIds,           // ✅ NUEVO
                }),

            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "No se pudo crear el producto")
                return
            }

            setProductos((prev) => [data.producto, ...prev])
            toast.success("Producto creado")

            setForm({
                nombre: "",
                slug: "",
                precio: "",
                categoria: "",
                descripcionCorta: "",
                descripcionLarga: "",
                stock: "",
                categoriaIds: [],               // ✅ reset
            })

        } catch (error) {
            console.error(error)
            toast.error("Error al crear producto")
        }
    }

    const toggleCampo = async (
        producto: Producto,
        campo: "activo" | "destacado"
    ) => {
        const nuevoValor = !producto[campo]

        try {
            const res = await fetch(`/api/admin/productos/${producto.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ [campo]: nuevoValor }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "No se pudo actualizar")
                return
            }

            setProductos((prev) =>
                prev.map((p) =>
                    p.id === producto.id ? { ...p, [campo]: nuevoValor } : p
                )
            )

            toast.success(
                campo === "activo"
                    ? nuevoValor
                        ? "Producto activado"
                        : "Producto desactivado"
                    : nuevoValor
                        ? "Marcado como destacado"
                        : "Quitado de destacados"
            )
        } catch (error) {
            console.error(error)
            toast.error("Error al actualizar producto")
        }
    }

    const handleDelete = async (producto: Producto) => {
        if (
            !window.confirm(
                `¿Seguro que querés eliminar "${producto.nombre}"?`
            )
        ) {
            return
        }

        try {
            const res = await fetch(`/api/admin/productos/${producto.id}`, {
                method: "DELETE",
                credentials: "include",
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "No se pudo eliminar")
                return
            }

            setProductos((prev) =>
                prev.filter((p) => p.id !== producto.id)
            )

            toast.success("Producto eliminado")
        } catch (error) {
            console.error(error)
            toast.error("Error al eliminar producto")
        }
    }

    async function actualizarPreciosMasivamente() {
        if (!porcentaje && !monto) {
            toast.error("Ingresá un porcentaje o un monto para actualizar.")
            return
        }

        if (
            !window.confirm(
                `Vas a actualizar los precios de TODOS los productos.\n\n` +
                `${porcentaje ? `• +${porcentaje}%\n` : ""}` +
                `${monto ? `• +$${monto}\n` : ""}\n` +
                `Los precios se redondean al múltiplo de $100 más cercano.\n\n¿Continuar?`
            )
        ) {
            return
        }

        try {
            setLoadingMasivo(true)

            const body = {
                porcentaje: porcentaje ? Number(porcentaje) : undefined,
                monto: monto ? Number(monto) : undefined,
            }

            const res = await fetch("/api/productos/update-prices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Error al actualizar precios")
                return
            }

            toast.success(
                `Se actualizaron ${data.cantidad} productos correctamente`
            )

            setPorcentaje("")
            setMonto("")

            fetchProductos()
        } catch (error) {
            console.error(error)
            toast.error("Error al actualizar precios")
        } finally {
            setLoadingMasivo(false)
        }
    }

    const handleOpenEdit = (producto: Producto) => {
        setEditingProduct(producto)
        setEditForm({
            nombre: producto.nombre,
            precio: String(producto.precio),
            stock: producto.stock != null ? String(producto.stock) : "",
            descripcionCorta: producto.descripcionCorta || "",
            descripcionLarga: producto.descripcionLarga || "",
            categoria: producto.categoria || "",
            categoriaIds: (producto.categorias || []).map((c) => c.categoria.id), // ✅
        })
    }


    const toggleCategoriaEnEdit = (catId: number) => {
        setEditForm((prev) => {
            const existe = prev.categoriaIds.includes(catId)
            return {
                ...prev,
                categoriaIds: existe
                    ? prev.categoriaIds.filter((id) => id !== catId)
                    : [...prev.categoriaIds, catId],
            }
        })
    }

    const toggleCategoriaEnForm = (catId: number) => {
        setForm((prev) => {
            const existe = prev.categoriaIds.includes(catId)
            return {
                ...prev,
                categoriaIds: existe
                    ? prev.categoriaIds.filter((id) => id !== catId)
                    : [...prev.categoriaIds, catId],
            }
        })
    }


    const handleEditChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setEditForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingProduct) return

        try {
            setSavingEdit(true)

            const res = await fetch(`/api/admin/productos/${editingProduct.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    nombre: editForm.nombre,
                    precio: Number(editForm.precio),
                    stock:
                        editForm.stock !== ""
                            ? Number(editForm.stock)
                            : null,
                    descripcionCorta: editForm.descripcionCorta,
                    descripcionLarga: editForm.descripcionLarga,
                    categoria: editForm.categoria || null,
                    categoriaIds: editForm.categoriaIds,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "No se pudo guardar")
                return
            }

            const productoActualizado: Producto = data.producto

            setProductos((prev) =>
                prev.map((p) =>
                    p.id === productoActualizado.id ? productoActualizado : p
                )
            )

            toast.success("Producto actualizado")
            setEditingProduct(null)
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar cambios")
        } finally {
            setSavingEdit(false)
        }
    }

    const handleCloseEdit = () => {
        if (savingEdit) return
        setEditingProduct(null)
    }

    return (
        <div className="container mx-auto px-4 py-10 space-y-8">
            <h1 className="text-2xl font-semibold mb-2">
                Panel de productos
            </h1>
            <p className="text-sm text-gray-600 mb-4">
                Creá, activá y gestioná los productos que se muestran en la tienda.
            </p>

            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-lg">Productos actuales</CardTitle>
                <div className="flex flex-col md:flex-row gap-2">
                    <a
                        href="/api/admin/reportes/ventas-productos?soloPagados=true"
                        className="text-sm"
                    >
                        <Button variant="outline" size="sm">
                            Exportar ventas por producto (CSV)
                        </Button>
                    </a>
                </div>
            </CardHeader>

            {/* Ajuste masivo */}
            <Card className="border-blue-300">
                <CardHeader>
                    <CardTitle className="text-blue-600">
                        Actualizar precios masivamente
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-xs text-gray-600">
                        Podés aplicar un porcentaje, un monto fijo o ambos.
                        Los precios se redondean automáticamente al múltiplo de $100 más cercano.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm">Aumento (%)</label>
                            <Input
                                type="number"
                                placeholder="Ej: 10"
                                value={porcentaje}
                                onChange={(e) => setPorcentaje(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm">Aumento fijo ($)</label>
                            <Input
                                type="number"
                                placeholder="Ej: 500"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={actualizarPreciosMasivamente}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={loadingMasivo}
                    >
                        {loadingMasivo ? "Actualizando..." : "Aplicar cambios a todos"}
                    </Button>
                </CardContent>
            </Card>

            {/* Crear producto */}
            <Card className="border-emerald-200">
                <CardHeader>
                    <CardTitle className="text-lg text-emerald-700">
                        Nuevo producto
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        onSubmit={handleCreate}
                    >
                        <div className="md:col-span-2">
                            <label className="text-sm block mb-1">
                                Nombre
                            </label>
                            <Input
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChangeForm}
                                placeholder="Ej: Sérum ácido hialurónico 30ml"
                            />
                        </div>
                        <div>
                            <label className="text-sm block mb-1">
                                Precio (ARS)
                            </label>
                            <Input
                                name="precio"
                                value={form.precio}
                                onChange={handleChangeForm}
                                placeholder="Ej: 14800"
                            />
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Slug (opcional)
                            </label>
                            <Input
                                name="slug"
                                value={form.slug}
                                onChange={handleChangeForm}
                                placeholder="serum-acido-hialuronico-30ml"
                            />
                            <p className="text-[11px] text-gray-500 mt-1">
                                Si lo dejás vacío, se genera automáticamente desde el nombre.
                            </p>
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Categoría principal (texto, opcional)
                            </label>
                            <Input
                                name="categoria"
                                value={form.categoria}
                                onChange={handleChangeForm}
                                placeholder="Ej: rostro, capilar..."
                            />
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Stock inicial
                            </label>
                            <Input
                                name="stock"
                                value={form.stock}
                                onChange={handleChangeForm}
                                placeholder="Ej: 10"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="text-sm block mb-1">
                                Descripción corta (opcional)
                            </label>
                            <Input
                                name="descripcionCorta"
                                value={form.descripcionCorta}
                                onChange={handleChangeForm}
                                placeholder="Breve texto para la tarjeta del producto"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="text-sm block mb-1">
                                Descripción Larga (opcional)
                            </label>
                            <Input
                                name="descripcionLarga"
                                value={form.descripcionLarga}             // ✅
                                onChange={handleChangeForm}               // ✅
                                placeholder="Modo de uso y componentes principales"
                            />
                        </div>

                        {categorias.length > 0 && (
                            <div className="md:col-span-3">
                                <label className="text-sm block mb-2">
                                    Categorías (múltiples)
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-auto border rounded-md p-2">
                                    {categorias.map((cat) => (
                                        <label
                                            key={cat.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={form.categoriaIds.includes(cat.id)}
                                                onChange={() => toggleCategoriaEnForm(cat.id)}
                                            />
                                            <span>{cat.nombre}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}



                        <div className="md:col-span-3 flex justify-end">
                            <Button type="submit">
                                Crear producto
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Listado */}
            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg">
                        Productos actuales
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-gray-500">
                            Cargando productos...
                        </p>
                    ) : productos.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            Todavía no hay productos cargados.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Categorías</TableHead>
                                    <TableHead>Activo</TableHead>
                                    <TableHead>Destacado</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productos.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {p.nombre}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    slug: {p.slug}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            ${p.precio.toLocaleString("es-AR")}
                                        </TableCell>
                                        <TableCell>
                                            {p.stock ?? 0}
                                        </TableCell>
                                        <TableCell className="max-w-[220px]">
                                            <span className="text-xs text-gray-700">
                                                {(p.categorias && p.categorias.length > 0)
                                                    ? p.categorias
                                                        .map((pc) => pc.categoria.nombre)
                                                        .join(", ")
                                                    : "—"}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={p.activo}
                                                    onCheckedChange={() =>
                                                        toggleCampo(p, "activo")
                                                    }
                                                />
                                                <span className="text-xs text-gray-600">
                                                    {p.activo ? "Visible" : "Oculto"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={p.destacado}
                                                    onCheckedChange={() =>
                                                        toggleCampo(p, "destacado")
                                                    }
                                                />
                                                <span className="text-xs text-gray-600">
                                                    {p.destacado
                                                        ? "Destacado"
                                                        : "Normal"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenEdit(p)}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(p)}
                                            >
                                                Eliminar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Modal de edición */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4">
                        <h2 className="text-lg font-semibold mb-2">
                            Editar producto
                        </h2>

                        <form className="space-y-4" onSubmit={handleSaveEdit}>
                            <div>
                                <label className="text-sm block mb-1">
                                    Nombre
                                </label>
                                <Input
                                    name="nombre"
                                    value={editForm.nombre}
                                    onChange={handleEditChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm block mb-1">
                                        Precio (ARS)
                                    </label>
                                    <Input
                                        name="precio"
                                        value={editForm.precio}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm block mb-1">
                                        Stock
                                    </label>
                                    <Input
                                        name="stock"
                                        value={editForm.stock}
                                        onChange={handleEditChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm block mb-1">
                                    Categoría principal (texto, opcional)
                                </label>
                                <Input
                                    name="categoria"
                                    value={editForm.categoria}
                                    onChange={handleEditChange}
                                    placeholder="Ej: rostro, capilar..."
                                />
                            </div>

                            <div>
                                <label className="text-sm block mb-1">
                                    Descripción corta
                                </label>
                                <Input
                                    name="descripcionCorta"
                                    value={editForm.descripcionCorta}
                                    onChange={handleEditChange}
                                />
                            </div>

                            <div className="md:col-span-3">
                                <label className="text-sm block mb-1">
                                    Descripción Larga (opcional)
                                </label>
                                <Input
                                    name="descripcionLarga"
                                    value={editForm.descripcionLarga}         // ✅
                                    onChange={handleEditChange}               // ✅
                                    placeholder="Modo de uso y componentes principales"
                                />
                            </div>


                            <div>
                                <label className="text-sm block mb-2">
                                    Categorías (múltiples)
                                </label>
                                {categorias.length === 0 ? (
                                    <p className="text-xs text-gray-500">
                                        No hay categorías cargadas. Crealas desde Prisma Studio (tabla <strong>Categoria</strong>).
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-auto border rounded-md p-2">
                                        {categorias.map((cat) => (
                                            <label
                                                key={cat.id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={editForm.categoriaIds.includes(cat.id)}
                                                    onChange={() =>
                                                        toggleCategoriaEnEdit(cat.id)
                                                    }
                                                />
                                                <span>{cat.nombre}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseEdit}
                                    disabled={savingEdit}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={savingEdit}>
                                    {savingEdit ? "Guardando..." : "Guardar cambios"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
