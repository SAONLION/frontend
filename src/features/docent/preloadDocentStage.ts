const DOCENT_MODEL_URL = '/models/docent/u.glb'

let docentAssetPreload: Promise<void> | null = null
let isDocentStagePreloaded = false

function preloadDocentModel() {
  if (!docentAssetPreload) {
    docentAssetPreload = fetch(DOCENT_MODEL_URL, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('도슨트 모델을 불러오지 못했어요.')
        }

        return response.arrayBuffer()
      })
      .then(() => undefined)
  }

  return docentAssetPreload
}

export function preloadDocentStage() {
  return Promise.all([
    import('../../components/domain/DocentCanvas'),
    preloadDocentModel(),
  ]).then(() => {
    isDocentStagePreloaded = true
  })
}

export function getDocentStagePreloadState() {
  return isDocentStagePreloaded
}
