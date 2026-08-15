import type { Product } from '../../types/product'

type ProductMediaProps = {
  product: Product
}

export function ProductMedia({ product }: ProductMediaProps) {
  return (
    <div className="stage-c-product-media">
      <img alt={product.name} className="stage-c-primary-cutout" decoding="async" fetchPriority="high" src={product.imageUrl} />
    </div>
  )
}
