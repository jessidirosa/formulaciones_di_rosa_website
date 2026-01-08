"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

    useEffect(() => {
        fetchCategorias()
    }, [])

    async function fetchCategorias() {
        try {
            setLoading(true)
            const res = await fetch("/api/admin/categorias", {
                credentials: "include",
            })
            if (!res.ok) throw new Error("No autorizado o error")
            const data = await res.json()
            setCategorias(data.categorias || [])
        } catch (e) {
            console.error(e)
            toast.error("Error al cargar categorías")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.nombre) {
            toast.error("El nombre es obligatorio")
            return
        }

        try {
            setSaving(true)
            const res = await fetch("/api/admin/categorias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "No se pudo crear la categoría")
                return
            }

            setCategorias((prev) => [...prev, data.categoria])
            setForm({ nombre: "", slug: "" })
            toast.success("Categoría creada")
        } catch (e) {
            console.error(e)
            toast.error("Error al crear categoría")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (cat: Categoria) => {
        if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return

        try {
            const res = await fetch(`/api/admin/categorias/${cat.id}`, {
                method: "DELETE",
                credentials: "include",
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || "No se pudo eliminar")
                return
            }
            setCategorias((prev) => prev.filter((c) => c.id !== cat.id))
            toast.success("Categoría eliminada")
        } catch (e) {
            console.error(e)
            toast.error("Error al eliminar categoría")
        }
    }

    return (
        <div className="container mx-auto px-4 py-10 space-y-8">
            <h1 className="text-2xl font-semibold mb-2">Categorías</h1>
            <p className="text-sm text-gray-600 mb-4">
                Administrá las categorías que podés asignar a los productos.
            </p>

            <Card className="border-emerald-200">
                <CardHeader>
                    <CardTitle className="text-emerald-700 text-lg">
                        Nueva categoría
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleCreate}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div className="md:col-span-2">
                            <label className="text-sm block mb-1">Nombre</label>
                            <Input
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Rostro, Capilar, Corporal..."
                            />
                        </div>
                        <div>
                            <label className="text-sm block mb-1">
                                Slug (opcional, para URL)
                            </label>
                            <Input
                                name="slug"
                                value={form.slug}
                                onChange={handleChange}
                                placeholder="rostro, capilar..."
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                            <Button type="submit" disabled={saving}>
                                {saving ? "Guardando..." : "Crear categoría"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg">Categorías actuales</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-gray-500">Cargando categorías...</p>
                    ) : categorias.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            Todavía no hay categorías creadas.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categorias.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell>{c.nombre}</TableCell>
                                        <TableCell className="text-xs text-gray-500">
                                            {c.slug}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(c)}
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
        </div>
    )
}
