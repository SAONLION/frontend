import { createContext } from 'react'
import type { ProductContentProviderValue } from '../../types/product'

export const productContentContext = createContext<ProductContentProviderValue | null>(null)
