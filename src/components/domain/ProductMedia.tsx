import { useSelectedProductImages } from '../../features/product-explore/useSelectedProductImages'
import type { Product } from '../../types/product'
import { ProductImageGallery } from './ProductImageGallery'

type ProductMediaProps = {
  product: Product
}

export function ProductMedia({ product }: ProductMediaProps) {
  const { imageUrl, detailImages } = useSelectedProductImages(product)

  return (
    <div className="stage-c-product-media">
      <ProductImageGallery alt={product.name} images={[imageUrl, ...detailImages]} />
    </div>
  )
}
