import { useEffect, useState } from 'react'
import { SESSION_ACTIONS } from '../session/sessionTypes'
import { useSession } from '../session/useSession'
import { useProductContent } from '../../services/product-content/useProductContent'
import type { Product } from '../../types/product'

export type ProductLoadState = Product | null | undefined

export function useStageCProduct(sku: string): ProductLoadState {
  const { dispatch } = useSession()
  const { getProduct } = useProductContent()
  const [product, setProduct] = useState<ProductLoadState>(undefined)

  useEffect(() => {
    let active = true
    setProduct(undefined)
    dispatch({ type: SESSION_ACTIONS.setCurrentSku, sku })
    void getProduct(sku).then((result) => {
      if (active) setProduct(result)
    })

    return () => {
      active = false
    }
  }, [dispatch, getProduct, sku])

  return product
}
