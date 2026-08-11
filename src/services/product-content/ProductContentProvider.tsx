import type { PropsWithChildren } from 'react'
import { productContentContext } from './ProductContentContext'
import type { ProductContentProviderValue } from '../../types/product'

type ProductContentProviderProps = PropsWithChildren<{
  value: ProductContentProviderValue
}>

export function ProductContentProvider({ children, value }: ProductContentProviderProps) {
  return <productContentContext.Provider value={value}>{children}</productContentContext.Provider>
}
