'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { formatearFechaArgentina } from '@/lib/capacity'
import { useToast } from "@/components/ui/toaster"


// Tipos
export interface Producto {
  id: string
  nombre: string
  slug: string
  precio: number
  imagen: string
  categoria: string
}

export interface CartItem {
  producto: Producto
  cantidad: number
  subtotal: number
}

export interface CartState {
  items: CartItem[]
  total: number
  cantidadItems: number
  fechaEstimada: string | null
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { producto: Producto; cantidad: number } }
  | { type: 'REMOVE_ITEM'; payload: { productoId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productoId: string; cantidad: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_ESTIMATED_DATE'; payload: { fecha: string } }
  | { type: 'LOAD_CART'; payload: CartState }

// Estado inicial
const initialState: CartState = {
  items: [],
  total: 0,
  cantidadItems: 0,
  fechaEstimada: null
}

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { producto, cantidad } = action.payload
      const existingItemIndex = state.items.findIndex(item => item.producto.id === producto.id)

      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Si el producto ya existe, actualizar cantidad
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? {
              ...item,
              cantidad: item.cantidad + cantidad,
              subtotal: (item.cantidad + cantidad) * item.producto.precio
            }
            : item
        )
      } else {
        // Si es un producto nuevo, agregarlo
        const newItem: CartItem = {
          producto,
          cantidad,
          subtotal: cantidad * producto.precio
        }
        newItems = [...state.items, newItem]
      }

      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0)
      const newCantidadItems = newItems.reduce((sum, item) => sum + item.cantidad, 0)

      return {
        ...state,
        items: newItems,
        total: newTotal,
        cantidadItems: newCantidadItems
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.producto.id !== action.payload.productoId)
      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0)
      const newCantidadItems = newItems.reduce((sum, item) => sum + item.cantidad, 0)

      return {
        ...state,
        items: newItems,
        total: newTotal,
        cantidadItems: newCantidadItems
      }
    }

    case 'UPDATE_QUANTITY': {
      const { productoId, cantidad } = action.payload

      if (cantidad <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productoId } })
      }

      const newItems = state.items.map(item =>
        item.producto.id === productoId
          ? {
            ...item,
            cantidad,
            subtotal: cantidad * item.producto.precio
          }
          : item
      )

      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0)
      const newCantidadItems = newItems.reduce((sum, item) => sum + item.cantidad, 0)

      return {
        ...state,
        items: newItems,
        total: newTotal,
        cantidadItems: newCantidadItems
      }
    }

    case 'CLEAR_CART':
      return initialState

    case 'SET_ESTIMATED_DATE':
      return {
        ...state,
        fechaEstimada: action.payload.fecha
      }

    case 'LOAD_CART':
      return action.payload

    default:
      return state
  }
}

// Context
const CartContext = createContext<{
  state: CartState
  addItem: (producto: Producto, cantidad?: number) => void
  removeItem: (productoId: string) => void
  updateQuantity: (productoId: string, cantidad: number) => void
  clearCart: () => void
  setEstimatedDate: (fecha: string) => void
} | null>(null)

// Provider
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { showToast } = useToast()

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('formulaciones-cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: parsedCart })
      } catch (error) {
        console.error('Error al cargar carrito:', error)
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('formulaciones-cart', JSON.stringify(state))
  }, [state])

  // Obtener fecha estimada cuando cambien los items
  useEffect(() => {
    if (state.cantidadItems > 0) {
      fetch('/api/fecha-estimada')
        .then(res => res.json())
        .then(data => {
          if (data.fechaEstimada) {
            const fechaFormateada = formatearFechaArgentina(new Date(data.fechaEstimada))
            dispatch({ type: 'SET_ESTIMATED_DATE', payload: { fecha: fechaFormateada } })
          }
        })
        .catch(error => console.error('Error al obtener fecha estimada:', error))
    } else {
      dispatch({ type: 'SET_ESTIMATED_DATE', payload: { fecha: '' } })
    }
  }, [state.cantidadItems])

  const addItem = (producto: Producto, cantidad = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { producto, cantidad } })
    showToast("Producto agregado al carrito 🛒")
  }

  const removeItem = (productoId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productoId } })
  }

  const updateQuantity = (productoId: string, cantidad: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productoId, cantidad } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const setEstimatedDate = (fecha: string) => {
    dispatch({ type: 'SET_ESTIMATED_DATE', payload: { fecha } })
  }

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      setEstimatedDate
    }}>
      {children}
    </CartContext.Provider>
  )
}

// Hook personalizado
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}