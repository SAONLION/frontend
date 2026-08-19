import { useSession } from '../session/useSession'
import { isSameColorSelection } from '../../constants/colorLabels'
import type { Product } from '../../types/product'

export type SelectedProductImages = {
  /** 화면에 보여줄 대표 컷 */
  imageUrl: string
  /** 대표 컷 뒤로 이어지는 같은 색상의 다른 각도 컷 */
  detailImages: readonly string[]
  /** 선택 색상에 대응하는 모델 컷. */
  stylingImages: readonly string[]
}

/**
 * C3-2에서 고른 컬러를 StageC 전체 화면에 반영한다.
 * 선택이 없거나 그 컬러의 컷이 없으면 제품 기본 이미지로 돌아간다.
 */
export function useSelectedProductImages(product: Product): SelectedProductImages {
  const { state } = useSession()
  const selected = state.selectedColorCode
    ? product.colorOptions?.find((option) => isSameColorSelection(option.code, state.selectedColorCode))
    : undefined

  if (!selected) {
    return {
      imageUrl: product.imageUrl,
      detailImages: product.detailImages ?? [],
      stylingImages: product.stylingImages ?? [],
    }
  }

  return {
    imageUrl: selected.imageUrl,
    detailImages: selected.detailImages ?? [],
    stylingImages: selected.stylingImages ?? product.stylingImages ?? [],
  }
}
