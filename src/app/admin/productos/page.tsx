// src/app/admin/productos/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import ProductosAdmin from "./ProductosAdmin"

export default async function AdminProductosPage() {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    // solo admins
    if (!session || user?.role !== "ADMIN") {
        redirect("/mi-cuenta/login")
    }

    return <ProductosAdmin />
}
