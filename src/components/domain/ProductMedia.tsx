import { useSelectedProductImages } from '../../features/product-explore/useSelectedProductImages'
import type { Product } from '../../types/product'
import { ProductCoverflow } from './ProductCoverflow'
import { ProductImageGallery } from './ProductImageGallery'

type ProductMediaProps = {
  enableCoverflow?: boolean
  product: Product
}

export function ProductMedia({ enableCoverflow = false, product }: ProductMediaProps) {
  const { imageUrl, detailImages } = useSelectedProductImages(product)
  const images = [imageUrl, ...detailImages]

  if (!enableCoverflow) {
    return (
      <div className="stage-c-product-media">
        <ProductImageGallery alt={product.name} images={images} />
      </div>
    )
  }

  return (
    <div className={`stage-c-product-media${images.length > 1 ? ' stage-c-product-media--coverflow' : ''}`}>
      <ProductCoverflow alt={product.name} imageClassName="stage-c-primary-cutout" images={images} label={`${product.name} 이미지`} variant="product" />
    </div>
  )
}
