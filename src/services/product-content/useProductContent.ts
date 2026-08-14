import { useContext } from 'react'
import { productContentContext } from './ProductContentContext'
import type { ProductContentProviderValue } from '../../types/product'

export function useProductContent(): ProductContentProviderValue {
  const value = useContext(productContentContext)

  if (!value) {
    throw new Error('ProductContentProvider 안에서 사용해야 합니다.')
  }

  return value
}
