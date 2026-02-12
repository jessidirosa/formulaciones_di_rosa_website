"use client"
import { Button } from "@/components/ui/button"
import { FastForward, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BotonSaltoSemana({ semanasSaltadas }: { semanasSaltadas: number }) {
    const router = useRouter()

    const manejarSalto = async (action: "incrementar" | "resetear") => {
        await fetch("/api/admin/config", {
            method: "POST",
            body: JSON.stringify({ action }),
            headers: { "Content-Type": "application/json" }
        })
        router.refresh()
    }

    return (
        <div className="flex gap-2 mt-2">
            <Button
                variant="outline"
                size="sm"
                className="text-[9px] h-6 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 flex items-center gap-1"
                onClick={() => manejarSalto("incrementar")}
            >
                <FastForward className="w-2.5 h-2.5" /> +1 Sem
            </Button>
            {semanasSaltadas > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-[9px] h-6 text-red-500 hover:text-red-700 p-0"
                    onClick={() => manejarSalto("resetear")}
                >
                    <RotateCcw className="w-2.5 h-2.5" />
                </Button>
            )}
        </div>
    )
}