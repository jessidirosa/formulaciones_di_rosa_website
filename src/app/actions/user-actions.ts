'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleUserTag(userId: any, currentTag: string | null) {
    try {
        // Si es PROFESIONAL lo quita (null), si no lo es, lo pone.
        const newTag = currentTag === 'PROFESIONAL' ? null : 'PROFESIONAL'

        await prisma.user.update({
            where: { id: userId },
            data: { tags: newTag }
        })

        // Esto refresca la tabla automáticamente para que veas el cambio
        revalidatePath('/admin/usuarios')

        return { success: true }
    } catch (error) {
        console.error("Error:", error)
        return { success: false }
    }
}