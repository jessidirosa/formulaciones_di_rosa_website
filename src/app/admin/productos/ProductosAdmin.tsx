"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import {
    FlaskConical,
    TrendingUp,
    Pencil,
    Trash2,
    FileDown,
    Plus,
    Loader2
} from "lucide-react"

// --- Interfaces ---
interface Categoria { id: number; nombre: string; slug: string }
interface Producto {
    id: number; nombre: string; slug: string; precio: number;
    categoria: string | null; descripcionCorta: string | null;
    descripcionLarga?: string | null; imagen: string | null;
    stock: number | null; activo: boolean; destacado: boolean;
    categorias?: { categoria: Categoria }[];
}

export default function ProductosAdmin() {
    const [productos, setProductos] = useState<Producto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)

    // FORMULARIO NUEVO COMPLETO
    const [form, setForm] = useState({
        nombre: "",
        slug: "",
        precio: "",
        categoria: "", // Categoría principal (texto)
        descripcionCorta: "",
        descripcionLarga: "",
        stock: "",
        activo: true,
        destacado: false,
        categoriaIds: [] as number[], // Categorías vinculadas (IDs)
    })

    // Masivo
    const [porcentaje, setPorcentaje] = useState("")
    const [monto, setMonto] = useState("")
    const [loadingMasivo, setLoadingMasivo] = useState(false)

    // EDICIÓN COMPLETA
    const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
    const [editForm, setEditForm] = useState({
        nombre: "", precio: "", stock: "", descripcionCorta: "",
        descripcionLarga: "", categoria: "", activo: true, destacado: false,
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
            const res = await fetch("/api/admin/productos", { credentials: "include" })
            const data = await res.json()
            setProductos(data.productos || [])
        } catch (error) { toast.error("Error al cargar inventario") } finally { setLoading(false) }
    }

    async function fetchCategorias() {
        try {
            const res = await fetch("/api/admin/categorias", { credentials: "include" })
            const data = await res.json()
            setCategorias(data.categorias || [])
        } catch (error) { console.error(error) }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.nombre || !form.precio) return toast.error("Nombre y precio son obligatorios")
        try {
            const res = await fetch("/api/admin/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    precio: Number(form.precio),
                    stock: form.stock !== "" ? Number(form.stock) : 0,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setProductos(prev => [data.producto, ...prev])
            toast.success("Producto creado")
            // Reset completo
            setForm({ nombre: "", slug: "", precio: "", categoria: "", descripcionCorta: "", descripcionLarga: "", stock: "", activo: true, destacado: false, categoriaIds: [] })
        } catch (error: any) { toast.error(error.message) }
    }

    const handleOpenEdit = (p: Producto) => {
        setEditingProduct(p)
        setEditForm({
            nombre: p.nombre,
            precio: String(p.precio),
            stock: p.stock != null ? String(p.stock) : "0",
            descripcionCorta: p.descripcionCorta || "",
            descripcionLarga: p.descripcionLarga || "",
            categoria: p.categoria || "",
            activo: p.activo,
            destacado: p.destacado,
            categoriaIds: (p.categorias || []).map((c) => c.categoria.id),
        })
    }

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingProduct) return
        try {
            setSavingEdit(true)
            const res = await fetch(`/api/admin/productos/${editingProduct.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...editForm,
                    precio: Number(editForm.precio),
                    stock: Number(editForm.stock),
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error()
            setProductos(prev => prev.map(p => p.id === data.producto.id ? data.producto : p))
            toast.success("Cambios guardados")
            setEditingProduct(null)
        } catch (error) { toast.error("Error al guardar") } finally { setSavingEdit(false) }
    }

    return (
        <div className="container mx-auto px-4 py-10 space-y-10 bg-[#F9F9F7] min-h-screen">
            {/* Cabecera y Reportes */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E9E9E0] pb-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[#3A4031]">Gestión de Fórmulas</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A3B18A] mt-1">Panel Administrativo Magistral</p>
                </div>
                <a href="/api/admin/reportes/ventas-productos?soloPagados=true">
                    <Button variant="outline" className="rounded-xl border-[#D6D6C2] text-[#5B6350] text-[10px] uppercase font-bold tracking-widest h-10 px-6">
                        <FileDown className="w-4 h-4" /> Exportar Ventas CSV
                    </Button>
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Lateral: Herramientas y Alta */}
                <div className="space-y-6">
                    {/* Actualización Masiva */}
                    <Card className="rounded-3xl shadow-lg border-none bg-blue-50/50">
                        <CardHeader className="border-b border-blue-100/50">
                            <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-blue-600 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Ajuste de Precios
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Input placeholder="Aumento %" type="number" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} className="rounded-xl border-blue-200" />
                                <Input placeholder="Monto fijo $" type="number" value={monto} onChange={e => setMonto(e.target.value)} className="rounded-xl border-blue-200" />
                            </div>
                            <Button className="w-full bg-blue-600 uppercase text-[10px] tracking-widest font-bold h-11 rounded-xl">Actualizar Catálogo</Button>
                        </CardContent>
                    </Card>

                    {/* NUEVO PRODUCTO (TODOS LOS CAMPOS RESTAURADOS) */}
                    <Card className="rounded-3xl shadow-lg border-none bg-white">
                        <CardHeader className="bg-[#A3B18A]/5 border-b border-[#A3B18A]/10">
                            <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-[#4A5D45] flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Registrar Fórmula
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <form onSubmit={handleCreate} className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase text-[#A3B18A] ml-1">Nombre</label>
                                    <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="rounded-xl" placeholder="Nombre de la fórmula" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-[#A3B18A] ml-1">Precio</label>
                                        <Input value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} className="rounded-xl" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-[#A3B18A] ml-1">Stock</label>
                                        <Input value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="rounded-xl" placeholder="Cant." />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase text-[#A3B18A] ml-1">Slug e Identificador</label>
                                    <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="rounded-xl" placeholder="slug-del-producto" />
                                    <Input value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="rounded-xl mt-2" placeholder="Categoría principal (ej: Rostro)" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase text-[#A3B18A] ml-1">Descripciones</label>
                                    <Input value={form.descripcionCorta} onChange={e => setForm({ ...form, descripcionCorta: e.target.value })} className="rounded-xl" placeholder="Resumen corto..." />
                                    <Textarea value={form.descripcionLarga} onChange={e => setForm({ ...form, descripcionLarga: e.target.value })} className="rounded-xl min-h-[100px] mt-2 bg-[#F9F9F7]" placeholder="Modo de uso, componentes y detalles (admite Enter)..." />
                                </div>
                                <div className="border rounded-xl p-3 bg-[#F9F9F7]">
                                    <p className="text-[10px] font-bold uppercase mb-2 text-[#A3B18A]">Vincular Categorías</p>
                                    <div className="max-h-24 overflow-y-auto space-y-1">
                                        {categorias.map(cat => (
                                            <label key={cat.id} className="flex items-center gap-2 text-[11px] font-medium text-[#5B6350]">
                                                <input type="checkbox" checked={form.categoriaIds.includes(cat.id)} onChange={() => {
                                                    const ids = form.categoriaIds.includes(cat.id) ? form.categoriaIds.filter(i => i !== cat.id) : [...form.categoriaIds, cat.id]
                                                    setForm({ ...form, categoriaIds: ids })
                                                }} /> {cat.nombre}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-[#4A5D45] uppercase text-[10px] tracking-widest font-bold h-12 rounded-xl">Crear Producto</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla de Inventario */}
                <div className="lg:col-span-2">
                    <Card className="rounded-[2.5rem] shadow-2xl border-none bg-white overflow-hidden">
                        <CardHeader className="px-8 pt-8 pb-4 border-b border-[#F9F9F7]">
                            <CardTitle className="text-xl font-serif text-[#3A4031] flex items-center gap-3">
                                <FlaskConical className="text-[#A3B18A]" /> Stock de Fórmulas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-[#F5F5F0]">
                                        <TableHead className="text-[10px] uppercase font-bold text-[#A3B18A]">Producto</TableHead>
                                        <TableHead className="text-[10px] uppercase font-bold text-[#A3B18A]">Precio</TableHead>
                                        <TableHead className="text-center text-[10px] uppercase font-bold text-[#A3B18A]">Estado</TableHead>
                                        <TableHead className="text-right text-[10px] uppercase font-bold text-[#A3B18A]">Editar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productos.map((p) => (
                                        <TableRow key={p.id} className="border-[#F5F5F0] hover:bg-[#F9F9F7]/50 transition-colors">
                                            <TableCell className="py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#3A4031] text-sm uppercase">{p.nombre}</span>
                                                    <span className="text-[10px] text-[#A3B18A] font-mono">STOCK: {p.stock ?? 0}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-serif font-bold text-[#4A5D45]">
                                                ${p.precio.toLocaleString("es-AR")}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {p.activo ? (
                                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">Activo</span>
                                                ) : (
                                                    <span className="text-[9px] bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">Oculto</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(p)} className="text-[#A3B18A] hover:text-[#4A5D45] rounded-lg">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* MODAL DE EDICIÓN CON TEXTAREA Y SWITCHES INTEGRADOS */}
            {editingProduct && (
                <div className="fixed inset-0 bg-[#3A4031]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-xl rounded-[2.5rem] shadow-2xl border-none bg-white overflow-hidden">
                        <CardHeader className="bg-[#F9F9F7] border-b p-8">
                            <CardTitle className="text-xl font-serif font-bold text-[#3A4031]">Editar: {editingProduct.nombre}</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSaveEdit}>
                            <CardContent className="p-8 space-y-4 max-h-[65vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-[10px] font-bold uppercase text-[#A3B18A]">Nombre Completo</label>
                                        <Input value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} className="rounded-xl h-11" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-[#A3B18A]">Precio (ARS)</label>
                                        <Input value={editForm.precio} onChange={e => setEditForm({ ...editForm, precio: e.target.value })} className="rounded-xl h-11" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-[#A3B18A]">Stock</label>
                                        <Input value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} className="rounded-xl h-11" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-[#A3B18A]">Descripción Corta</label>
                                    <Input value={editForm.descripcionCorta} onChange={e => setEditForm({ ...editForm, descripcionCorta: e.target.value })} className="rounded-xl h-11" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-[#A3B18A]">Descripción Detallada (admite saltos de línea)</label>
                                    <Textarea
                                        value={editForm.descripcionLarga}
                                        onChange={e => setEditForm({ ...editForm, descripcionLarga: e.target.value })}
                                        className="rounded-xl min-h-[150px] bg-[#F9F9F7] focus:bg-white transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-[#F9F9F7] p-4 rounded-2xl border border-[#E9E9E0]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-[#5B6350]">Producto Activo</span>
                                        <Switch checked={editForm.activo} onCheckedChange={(val) => setEditForm({ ...editForm, activo: val })} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-[#5B6350]">Destacado</span>
                                        <Switch checked={editForm.destacado} onCheckedChange={(val) => setEditForm({ ...editForm, destacado: val })} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-[#A3B18A]">Vincular Categorías</label>
                                    <div className="grid grid-cols-2 gap-2 border rounded-xl p-3 bg-[#F9F9F7]">
                                        {categorias.map(cat => (
                                            <label key={cat.id} className="flex items-center gap-2 text-xs text-[#5B6350]">
                                                <input type="checkbox" checked={editForm.categoriaIds.includes(cat.id)} onChange={() => {
                                                    const ids = editForm.categoriaIds.includes(cat.id) ? editForm.categoriaIds.filter(i => i !== cat.id) : [...editForm.categoriaIds, cat.id]
                                                    setEditForm({ ...editForm, categoriaIds: ids })
                                                }} /> {cat.nombre}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            <footer className="p-8 pt-0 flex gap-4 bg-white">
                                <Button type="button" variant="ghost" onClick={() => setEditingProduct(null)} className="flex-1 rounded-xl text-[10px] font-bold uppercase h-12">Cancelar</Button>
                                <Button type="submit" disabled={savingEdit} className="flex-1 bg-[#4A5D45] hover:bg-[#3D4C39] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest h-12 shadow-md">
                                    {savingEdit ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            </footer>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}