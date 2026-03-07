'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tag, Loader2 } from "lucide-react"
import { toggleUserTag } from "@/app/actions/user-actions"

interface UserTagButtonProps {
    userId: any
    currentTag: string | null
}

export default function UserTagButton({ userId, currentTag }: UserTagButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        setLoading(true)
        try {
            const result = await toggleUserTag(userId, currentTag)
            if (!result.success) {
                alert("Error al actualizar el usuario")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={handleToggle}
            className="h-8 w-8 p-0 rounded-full hover:bg-indigo-50 group"
            title="Cambiar categoría a Profesional"
        >
            {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            ) : (
                <Tag className={`w-3.5 h-3.5 transition-colors ${currentTag === 'PROFESIONAL' ? 'text-indigo-600' : 'text-gray-300 group-hover:text-indigo-600'
                    }`} />
            )}
        </Button>
    )
}