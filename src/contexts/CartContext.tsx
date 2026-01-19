'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
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
  | { type: 'SET_ESTIMATED_DATE'; payload: { fecha: string | null } }
  | { type: 'LOAD_CART'; payload: CartState }

// Estado inicial
const initialState: CartState = {
  items: [],
  total: 0,
  cantidadItems: 0,
  fechaEstimada: null,
}

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { producto, cantidad } = action.payload
      const existingItemIndex = state.items.findIndex(
        item => item.producto.id === producto.id
      )

      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? {
              ...item,
              cantidad: item.cantidad + cantidad,
              subtotal: (item.cantidad + cantidad) * item.producto.precio,
            }
            : item
        )
      } else {
        const newItem: CartItem = {
          producto,
          cantidad,
          subtotal: cantidad * producto.precio,
        }
        newItems = [...state.items, newItem]
      }

      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0)
      const newCantidadItems = newItems.reduce((sum, item) => sum + item.cantidad, 0)

      return {
        ...state,
        items: newItems,
        total: newTotal,
        cantidadItems: newCantidadItems,
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        item => item.producto.id !== action.payload.productoId
      )
      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0)
      const newCantidadItems = newItems.reduce((sum, item) => sum + item.cantidad, 0)

      return {
        ...state,
        items: newItems,
        total: newTotal,
        cantidadItems: newCantidadItems,
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
            subtotal: cantidad * item.producto.precio,
          }
          : item
      )

      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0)
      const newCantidadItems = newItems.reduce((sum, item) => sum + item.cantidad, 0)

      return {
        ...state,
        items: newItems,
        total: newTotal,
        cantidadItems: newCantidadItems,
      }
    }

    case 'CLEAR_CART':
      return initialState

    case 'SET_ESTIMATED_DATE':
      return {
        ...state,
        fechaEstimada: action.payload.fecha,
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
  setEstimatedDate: (fecha: string | null) => void
} | null>(null)

// Provider
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { showToast } = useToast()

  // 1) Cargar carrito desde localStorage al iniciar
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

  // 2) Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('formulaciones-cart', JSON.stringify(state))
  }, [state])

  // 3) Fecha estimada (MISMA lógica que backend)
  // - Se recalcula cuando cambia la cantidad de items (agregar/quitar)
  // - Se evita fetch si está vacío
  useEffect(() => {
    const loadEstimatedDate = async () => {
      try {
        if (state.cantidadItems <= 0) {
          dispatch({ type: 'SET_ESTIMATED_DATE', payload: { fecha: null } })
          return
        }

        const res = await fetch('/api/capacity/estimated-date', {
          method: 'GET',
          cache: 'no-store',
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok || !data?.ok) {
          console.error('Error API fecha estimada:', data?.error || res.statusText)
          // Si falla, no rompemos la UI: simplemente no mostramos
          dispatch({ type: 'SET_ESTIMATED_DATE', payload: { fecha: null } })
          return
        }

        // ✅ data.formatted ya viene listo para UI (dd/MM/yyyy)
        dispatch({
          type: 'SET_ESTIMATED_DATE',
          payload: { fecha: data.formatted || null },
        })
      } catch (error) {
        console.error('Error al obtener fecha estimada:', error)
        dispatch({ type: 'SET_ESTIMATED_DATE', payload: { fecha: null } })
      }
    }

    loadEstimatedDate()
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

  const setEstimatedDate = (fecha: string | null) => {
    dispatch({ type: 'SET_ESTIMATED_DATE', payload: { fecha } })
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setEstimatedDate,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}
