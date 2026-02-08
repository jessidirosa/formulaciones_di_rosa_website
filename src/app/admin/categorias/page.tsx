"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, X, Check, Plus } from "lucide-react"
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

export default function CategoriasAdminPage() {
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ nombre: "", slug: "" })
    const [saving, setSaving] = useState(false)

    // Estado para edición
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState({ nombre: "", slug: "" })

    useEffect(() => {
        fetchCategorias()
    }, [])

    async function fetchCategorias() {
        try {
            setLoading(true)
            const res = await fetch("/api/admin/categorias", { credentials: "include" })
            if (!res.ok) throw new Error("No autorizado")
            const data = await res.json()
            setCategorias(data.categorias || [])
        } catch (e) {
            toast.error("Error al cargar categorías")
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.nombre) return toast.error("El nombre es obligatorio")

        try {
            setSaving(true)
            const res = await fetch("/api/admin/categorias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setCategorias((prev) => [...prev, data.categoria])
            setForm({ nombre: "", slug: "" })
            toast.success("Categoría creada")
        } catch (e: any) {
            toast.error(e.message || "Error al crear")
        } finally {
            setSaving(false)
        }
    }

    const startEdit = (c: Categoria) => {
        setEditingId(c.id)
        setEditForm({ nombre: c.nombre, slug: c.slug })
    }

    const handleUpdate = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/categorias/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            })
            if (!res.ok) throw new Error()

            setCategorias(prev => prev.map(c => c.id === id ? { ...c, ...editForm } : c))
            setEditingId(null)
            toast.success("Categoría actualizada")
        } catch (e) {
            toast.error("Error al actualizar")
        }
    }

    const handleDelete = async (cat: Categoria) => {
        if (!window.confirm(`¿Eliminar "${cat.nombre}"? Se quitará de todos los productos.`)) return

        try {
            const res = await fetch(`/api/admin/categorias/${cat.id}`, { method: "DELETE" })
            if (!res.ok) throw new Error()
            setCategorias((prev) => prev.filter((c) => c.id !== cat.id))
            toast.success("Categoría eliminada")
        } catch (e) {
            toast.error("Error al eliminar")
        }
    }

    return (
        <div className="container mx-auto px-4 py-10 space-y-8 text-left">
            <div>
                <h1 className="text-3xl font-bold text-[#3A4031]">Gestión de Categorías</h1>
                <p className="text-sm text-gray-500 italic">Organizá el catálogo de Di Rosa Formulaciones.</p>
            </div>

            <Card className="border-[#A3B18A]/30 shadow-sm bg-white rounded-2xl">
                <CardHeader className="border-b border-gray-50">
                    <CardTitle className="text-[#4A5D45] text-lg flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Nueva Categoría
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-[#A3B18A] mb-1.5 block">Nombre</label>
                            <Input
                                value={form.nombre}
                                onChange={e => setForm({ ...form, nombre: e.target.value })}
                                placeholder="Ej: Rostro, Capilar..."
                                className="rounded-xl border-gray-200"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-[#A3B18A] mb-1.5 block">Slug (URL)</label>
                            <Input
                                value={form.slug}
                                onChange={e => setForm({ ...form, slug: e.target.value })}
                                placeholder="rostro-capilar"
                                className="rounded-xl border-gray-200"
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                            <Button type="submit" disabled={saving} className="bg-[#4A5D45] hover:bg-[#3A4031] text-white rounded-xl px-8 uppercase text-[10px] font-bold tracking-widest">
                                {saving ? "Guardando..." : "Crear Categoría"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-[#F9F9F7]">
                            <TableRow>
                                <TableHead className="text-[10px] font-bold uppercase text-[#A3B18A]">Nombre</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-[#A3B18A]">Slug</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categorias.map((c) => (
                                <TableRow key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell className="font-medium">
                                        {editingId === c.id ? (
                                            <Input
                                                value={editForm.nombre}
                                                onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                                                className="h-8 rounded-lg"
                                            />
                                        ) : c.nombre}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-400">
                                        {editingId === c.id ? (
                                            <Input
                                                value={editForm.slug}
                                                onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                                                className="h-8 rounded-lg"
                                            />
                                        ) : c.slug}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {editingId === c.id ? (
                                            <>
                                                <Button size="icon" variant="ghost" className="text-emerald-600" onClick={() => handleUpdate(c.id)}>
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-400" onClick={() => setEditingId(null)}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="icon" variant="ghost" className="text-[#A3B18A]" onClick={() => startEdit(c)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-300 hover:text-red-500" onClick={() => handleDelete(c)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}