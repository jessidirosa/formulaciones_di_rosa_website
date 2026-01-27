'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Props {
    cuponId: number
    codigo: string
}

export default function BotonEliminarCupon({ cuponId, codigo }: Props) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleEliminar = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/cupones/${cuponId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                toast.success(`Cupón ${codigo} eliminado definitivamente`)
                router.refresh()
            } else {
                const data = await res.json()
                throw new Error(data.error || "No se pudo eliminar")
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="rounded-3xl border-[#E9E9E0]">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 text-red-600 mb-2">
                        <AlertCircle className="w-6 h-6" />
                        <AlertDialogTitle className="font-bold">¿Eliminar cupón?</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-sm text-gray-600">
                        Estás por borrar el cupón <strong className="text-gray-900">{codigo}</strong>.
                        Esta acción no se puede deshacer y los clientes ya no podrán utilizarlo en el checkout.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="rounded-xl border-[#E9E9E0] text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleEliminar}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest px-6"
                    >
                        Confirmar Borrado
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}