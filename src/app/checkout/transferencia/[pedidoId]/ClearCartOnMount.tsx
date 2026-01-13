'use client'

import { useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'

export default function ClearCartOnMount() {
    const { clearCart } = useCart()

    useEffect(() => {
        clearCart()
    }, [clearCart])

    return null
}
