"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function CategoriesMenu({
    categorias,
}: {
    categorias: { nombre: string; slug: string }[]
}) {
    return (
        <div className="flex flex-wrap gap-3 mb-6">
            <Link href="/tienda">
                <Badge
                    variant="outline"
                    className="px-4 py-2 cursor-pointer border-gray-300 hover:bg-white"
                >
                    Todas
                </Badge>
            </Link>

            {categorias.map((cat) => (
                <Link key={cat.slug} href={`/tienda?categoria=${cat.slug}`}>
                    <Badge
                        variant="outline"
                        className="px-4 py-2 cursor-pointer border-green-200 text-green-700 hover:bg-white"
                    >
                        {cat.nombre}
                    </Badge>
                </Link>
            ))}
        </div>
    )
}
