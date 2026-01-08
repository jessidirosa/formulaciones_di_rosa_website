"use client"

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react"

type ToastContextType = {
    showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
    const ctx = useContext(ToastContext)
    if (!ctx) {
        throw new Error("useToast debe usarse dentro de <ToastProvider>")
    }
    return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [message, setMessage] = useState<string>("")
    const [open, setOpen] = useState(false)

    const showToast = useCallback((msg: string) => {
        setMessage(msg)
        setOpen(true)
    }, [])

    // Auto-cerrar después de 3 segundos
    useEffect(() => {
        if (!open) return
        const timer = setTimeout(() => setOpen(false), 3000)
        return () => clearTimeout(timer)
    }, [open])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* UI del toast */}
            {open && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div className="rounded-lg bg-gray-900 text-white px-4 py-3 shadow-lg text-sm flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                        <span>{message}</span>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    )
}
