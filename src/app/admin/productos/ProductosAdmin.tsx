"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import AdminImageUpload from "@/components/admin/AdminImageUpload"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import {
    Pencil,
    Trash2,
    FileDown,
    Plus,
    X,
    Sparkles,
    Loader2,
    TrendingUp
} from "lucide-react"

// --- Interfaces ---
interface Presentacion {
    id?: number
    nombre: string
    precio: string | number
    stock: string | number
}

interface Categoria { id: number; nombre: string; slug: string }

interface Producto {
    id: number;
    nombre: string;
    slug: string;
    precio: number;
    categoria: string | null;
    descripcionCorta: string | null;
    descripcionLarga?: string | null;
    imagen: string | null;
    stock: number | null;
    activo: boolean;
    destacado: boolean;
    categorias?: { categoria: Categoria }[];
    presentaciones?: Presentacion[];
}

export default function ProductosAdmin() {
    const [productos, setProductos] = useState<Producto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)

    const [porcentaje, setPorcentaje] = useState("")
    const [monto, setMonto] = useState("")
    const [loadingMasivo, setLoadingMasivo] = useState(false)

    const [form, setForm] = useState({
        nombre: "",
        slug: "",
        precio: "0",
        categoria: "",
        descripcionCorta: "",
        descripcionLarga: "",
        imagen: "",
        stock: "0",
        activo: true,
        destacado: false,
        categoriaIds: [] as number[],
        presentaciones: [{ nombre: "", precio: "", stock: "" }] as Presentacion[],
    })

    const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
    const [editForm, setEditForm] = useState({
        nombre: "",
        precio: "",
        stock: "",
        descripcionCorta: "",
        descripcionLarga: "",
        imagen: "",
        categoria: "",
        activo: true,
        destacado: false,
        categoriaIds: [] as number[],
        presentaciones: [] as Presentacion[]
    })
    const [savingEdit, setSavingEdit] = useState(false)

    useEffect(() => {
        fetchProductos()
        fetchCategorias()
    }, [])

    async function fetchProductos() {
        try {
            setLoading(true)
            const res = await fetch("/api/admin/productos")
            const data = await res.json()
            setProductos(data.productos || [])
        } catch (error) { toast.error("Error al cargar inventario") } finally { setLoading(false) }
    }

    async function fetchCategorias() {
        try {
            const res = await fetch("/api/admin/categorias")
            const data = await res.json()
            setCategorias(data.categorias || [])
        } catch (error) { console.error(error) }
    }

    const handleAumentoMasivo = async () => {
        if (!porcentaje && !monto) return toast.error("Ingresa un valor para ajustar")
        setLoadingMasivo(true)
        try {
            const res = await fetch("/api/admin/productos/masivo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ porcentaje, monto })
            })
            if (res.ok) {
                toast.success("Catálogo actualizado")
                fetchProductos()
                setPorcentaje("")
                setMonto("")
            } else { toast.error("Error al procesar el aumento") }
        } catch (error) { toast.error("Error de conexión") } finally { setLoadingMasivo(false) }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.nombre) return toast.error("El nombre es obligatorio")
        try {
            const res = await fetch("/api/admin/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setProductos(prev => [data.producto, ...prev])
            toast.success("Producto creado")
            setForm({
                nombre: "", slug: "", precio: "0", categoria: "",
                descripcionCorta: "", descripcionLarga: "", imagen: "", stock: "0",
                activo: true, destacado: false, categoriaIds: [],
                presentaciones: [{ nombre: "", precio: "", stock: "" }]
            })
        } catch (error: any) { toast.error(error.message) }
    }

    const handleOpenEdit = (p: Producto) => {
        setEditingProduct(p)
        setEditForm({
            nombre: p.nombre,
            precio: String(p.precio),
            stock: String(p.stock || 0),
            descripcionCorta: p.descripcionCorta || "",
            descripcionLarga: p.descripcionLarga || "",
            imagen: p.imagen || "",
            categoria: p.categoria || "",
            activo: p.activo,
            destacado: p.destacado,
            categoriaIds: (p.categorias || []).map((c) => c.categoria.id),
            presentaciones: p.presentaciones || []
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
                body: JSON.stringify(editForm),
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E9E9E0] pb-6">
                <div className="text-left">
                    <h1 className="text-3xl font-serif font-bold text-[#3A4031]">Gestión de Fórmulas</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A3B18A] mt-1">Panel Administrativo Magistral</p>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                <div className="space-y-6">
                    <Card className="rounded-3xl shadow-lg border-none bg-blue-50/50">
                        <CardHeader>
                            <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-blue-600 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Ajuste de Precios
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 pt-0">
                            <div className="grid grid-cols-2 gap-3">
                                <Input placeholder="Aumento %" type="number" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} className="rounded-xl border-blue-200 bg-white" />
                                <Input placeholder="Monto fijo $" type="number" value={monto} onChange={e => setMonto(e.target.value)} className="rounded-xl border-blue-200 bg-white" />
                            </div>
                            <Button onClick={handleAumentoMasivo} disabled={loadingMasivo} className="w-full bg-blue-600 uppercase text-[10px] tracking-widest font-bold h-11 rounded-xl text-white">
                                {loadingMasivo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar Catálogo"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl shadow-lg border-none bg-white">
                        <CardHeader className="bg-[#A3B18A]/5 border-b border-[#A3B18A]/10">
                            <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-[#4A5D45] flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Registrar Fórmula
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-[#A3B18A]">Imagen de Producto</label>
                                    <AdminImageUpload
                                        value={form.imagen}
                                        onChange={(url) => setForm({ ...form, imagen: url })}
                                        onRemove={() => setForm({ ...form, imagen: "" })}
                                    />
                                </div>
                                <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="rounded-xl" />
                                <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Slug (opcional)" className="rounded-xl" />
                                <Input value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} placeholder="Categoría Texto (ej: Rostro)" className="rounded-xl" />
                                <Input value={form.descripcionCorta} onChange={e => setForm({ ...form, descripcionCorta: e.target.value })} placeholder="Descripción corta" className="rounded-xl" />
                                <Textarea value={form.descripcionLarga} onChange={e => setForm({ ...form, descripcionLarga: e.target.value })} placeholder="Descripción detallada (admite saltos de línea)" className="rounded-xl min-h-[100px]" />

                                <div className="space-y-3 bg-[#F9F9F7] p-4 rounded-2xl border border-[#E9E9E0]">
                                    <p className="text-[10px] font-bold uppercase text-[#4A5D45] flex items-center gap-1"><Sparkles className="w-3 h-3" /> Presentaciones</p>
                                    {form.presentaciones.map((p, i) => (
                                        <div key={i} className="flex gap-1 items-center">
                                            <Input placeholder="Vol" value={p.nombre} onChange={e => {
                                                const n = [...form.presentaciones]; n[i].nombre = e.target.value; setForm({ ...form, presentaciones: n })
                                            }} className="h-8 text-xs bg-white" />
                                            <Input placeholder="$" value={p.precio} onChange={e => {
                                                const n = [...form.presentaciones]; n[i].precio = e.target.value; setForm({ ...form, presentaciones: n })
                                            }} className="h-8 text-xs bg-white" />
                                            <Input placeholder="Stock" value={p.stock} onChange={e => {
                                                const n = [...form.presentaciones]; n[i].stock = e.target.value; setForm({ ...form, presentaciones: n })
                                            }} className="h-8 text-xs bg-white" />
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, presentaciones: form.presentaciones.filter((_, idx) => idx !== i) })}><X className="w-3 h-3 text-red-400" /></Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="ghost" className="w-full text-[9px] uppercase font-bold" onClick={() => setForm({ ...form, presentaciones: [...form.presentaciones, { nombre: "", precio: "", stock: "" }] })}>+ Añadir Medida</Button>
                                </div>

                                <div className="flex items-center justify-between bg-[#F9F9F7] p-3 rounded-xl border">
                                    <span className="text-[10px] font-bold uppercase text-[#5B6350]">¿Es destacado?</span>
                                    <Switch checked={form.destacado} onCheckedChange={v => setForm({ ...form, destacado: v })} />
                                </div>

                                <div className="border rounded-xl p-3 bg-[#F9F9F7]">
                                    <p className="text-[10px] font-bold uppercase mb-2 text-[#A3B18A]">Categorías Web</p>
                                    <div className="max-h-24 overflow-y-auto space-y-1">
                                        {categorias.map(cat => (
                                            <label key={cat.id} className="flex items-center gap-2 text-[11px] font-medium text-[#5B6350]">
                                                <input type="checkbox" checked={form.categoriaIds.includes(cat.id)} onChange={() => {
                                                    const ids = form.categoriaIds.includes(cat.id) ? form.categoriaIds.filter(id => id !== cat.id) : [...form.categoriaIds, cat.id]
                                                    setForm({ ...form, categoriaIds: ids })
                                                }} /> {cat.nombre}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-[#4A5D45] uppercase text-[10px] tracking-widest font-bold h-12 rounded-xl text-white">Crear Producto</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="rounded-[2.5rem] shadow-2xl border-none bg-white overflow-hidden">
                        <CardContent className="px-8 py-8">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-[#F5F5F0]">
                                        <TableHead className="text-[10px] uppercase font-bold text-[#A3B18A]">Imagen</TableHead>
                                        <TableHead className="text-[10px] uppercase font-bold text-[#A3B18A]">Fórmula</TableHead>
                                        <TableHead className="text-center text-[10px] uppercase font-bold text-[#A3B18A]">Estado</TableHead>
                                        <TableHead className="text-right text-[10px] uppercase font-bold text-[#A3B18A]">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productos.map((p) => (
                                        <TableRow key={p.id} className="border-[#F5F5F0]">
                                            <TableCell>
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F5F0] border border-[#E9E9E0]">
                                                    <img src={p.imagen || "https://placehold.co/100"} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#3A4031] text-sm uppercase">{p.nombre}</span>
                                                    <div className="flex gap-2 mt-1">
                                                        {p.destacado && <Badge className="bg-[#4A5D45] text-[8px] h-4">Destacado</Badge>}
                                                        <span className="text-[9px] text-[#A3B18A] uppercase font-bold">{p.categoria || 'Sin Categoría'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {p.activo ? <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase">Activo</span> : <span className="text-[9px] bg-gray-100 text-gray-400 px-2 py-1 rounded-full font-bold uppercase">Oculto</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(p)} className="text-[#A3B18A] hover:text-[#4A5D45]"><Pencil className="w-4 h-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal Edición Completo */}
            {editingProduct && (
                <div className="fixed inset-0 bg-[#3A4031]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-xl rounded-[2.5rem] shadow-2xl border-none bg-white overflow-hidden text-left">
                        <CardHeader className="bg-[#F9F9F7] border-b p-8">
                            <CardTitle className="font-serif text-xl">Editar: {editingProduct.nombre}</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSaveEdit}>
                            <CardContent className="p-8 space-y-4 max-h-[60vh] overflow-y-auto pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-[#A3B18A]">Imagen del Producto</label>
                                    <AdminImageUpload
                                        value={editForm.imagen}
                                        onChange={(url) => setEditForm({ ...editForm, imagen: url })}
                                        onRemove={() => setEditForm({ ...editForm, imagen: "" })}
                                    />
                                </div>
                                <Input value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} placeholder="Nombre" className="rounded-xl h-11" />
                                <Input value={editForm.categoria} onChange={e => setEditForm({ ...editForm, categoria: e.target.value })} placeholder="Categoría Texto" className="rounded-xl h-11" />
                                <Input value={editForm.descripcionCorta} onChange={e => setEditForm({ ...editForm, descripcionCorta: e.target.value })} placeholder="Descripción corta" className="rounded-xl h-11" />
                                <Textarea value={editForm.descripcionLarga} onChange={e => setEditForm({ ...editForm, descripcionLarga: e.target.value })} className="rounded-xl min-h-[120px]" placeholder="Descripción magistral detallada" />

                                <div className="space-y-3 bg-[#F9F9F7] p-4 rounded-2xl border">
                                    <p className="text-[10px] font-bold uppercase text-[#4A5D45]">Presentaciones Activas</p>
                                    {editForm.presentaciones.map((p, i) => (
                                        <div key={i} className="flex gap-2">
                                            <Input placeholder="Nombre" value={p.nombre} onChange={e => {
                                                const n = [...editForm.presentaciones]; n[i].nombre = e.target.value; setEditForm({ ...editForm, presentaciones: n })
                                            }} className="h-9 text-xs bg-white" />
                                            <Input placeholder="Precio" value={p.precio} onChange={e => {
                                                const n = [...editForm.presentaciones]; n[i].precio = e.target.value; setEditForm({ ...editForm, presentaciones: n })
                                            }} className="h-9 text-xs bg-white" />
                                            <Input placeholder="Stock" value={p.stock} onChange={e => {
                                                const n = [...editForm.presentaciones]; n[i].stock = e.target.value; setEditForm({ ...editForm, presentaciones: n })
                                            }} className="h-9 text-xs bg-white" />
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setEditForm({ ...editForm, presentaciones: editForm.presentaciones.filter((_, idx) => idx !== i) })}><Trash2 className="w-4 h-4 text-red-300" /></Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="ghost" className="w-full text-[10px] font-bold uppercase" onClick={() => setEditForm({ ...editForm, presentaciones: [...editForm.presentaciones, { nombre: "", precio: "", stock: "" }] })}>+ Añadir Medida</Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-[#F9F9F7] p-4 rounded-2xl border">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-[#5B6350]">Visible</span>
                                        <Switch checked={editForm.activo} onCheckedChange={v => setEditForm({ ...editForm, activo: v })} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-[#5B6350]">Destacado</span>
                                        <Switch checked={editForm.destacado} onCheckedChange={v => setEditForm({ ...editForm, destacado: v })} />
                                    </div>
                                </div>

                                <div className="border rounded-xl p-3 bg-white">
                                    <p className="text-[10px] font-bold uppercase mb-2 text-[#A3B18A]">Categorías Vinculadas</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {categorias.map(cat => (
                                            <label key={cat.id} className="flex items-center gap-2 text-[11px] font-medium text-[#5B6350]">
                                                <input type="checkbox" checked={editForm.categoriaIds.includes(cat.id)} onChange={() => {
                                                    const ids = editForm.categoriaIds.includes(cat.id) ? editForm.categoriaIds.filter(id => id !== cat.id) : [...editForm.categoriaIds, cat.id]
                                                    setEditForm({ ...editForm, categoriaIds: ids })
                                                }} /> {cat.nombre}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            <footer className="p-8 pt-0 flex gap-4 bg-white mt-4">
                                <Button type="button" variant="ghost" onClick={() => setEditingProduct(null)} className="flex-1 rounded-xl h-12 text-[10px] uppercase font-bold border">Cancelar</Button>
                                <Button type="submit" className="flex-1 bg-[#4A5D45] text-white rounded-xl h-12 text-[10px] uppercase font-bold tracking-widest">{savingEdit ? <Loader2 className="animate-spin h-4 w-4" /> : "Guardar Cambios"}</Button>
                            </footer>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}