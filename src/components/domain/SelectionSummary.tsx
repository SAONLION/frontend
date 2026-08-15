import { GlassInfoCard } from './StageCDetailShell'

type SelectionSummaryProps = {
  productName: string
  sizeLabel: string
  colorLabel: string
  dimensions: string
  imageUrl: string
}

export function SelectionSummary({ productName, sizeLabel, colorLabel, dimensions, imageUrl }: SelectionSummaryProps) {
  return (
    <GlassInfoCard>
      <div className="stage-c-selection-summary">
        <img alt="선택한 제품" decoding="async" src={imageUrl} />
        <div>
          <p className="stage-c-selection-summary__eyebrow">선택한 제품</p>
          <h1>{productName}</h1>
          <dl>
            <div><dt>사이즈</dt><dd>{sizeLabel}</dd></div>
            <div><dt>컬러</dt><dd>{colorLabel}</dd></div>
            <div><dt>치수</dt><dd>{dimensions}</dd></div>
          </dl>
        </div>
      </div>
    </GlassInfoCard>
  )
}
