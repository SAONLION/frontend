import type { Product } from '../../types/product'

type ProductMediaProps = {
  product: Product
}

export function ProductMedia({ product }: ProductMediaProps) {
  return (
    <div className="stage-c-product-media">
      <img alt={product.name} src={product.imageUrl} />
    </div>
  )
}
