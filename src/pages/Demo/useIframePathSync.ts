import { useEffect, type RefObject } from 'react'

// React Router는 pushState로 이동하는데, 그건 바깥 창에 아무 이벤트도 남기지 않는다.
// iframe의 load 이벤트도 최초 문서 로드에만 오므로 화면 전환을 잡지 못한다.
// 그래서 같은 오리진의 이점을 살려 위치를 짧은 주기로 읽는다 — 문자열 비교 한 번이라 비용이 없다.
const SYNC_INTERVAL_MS = 250

/**
 * iframe 안 앱이 이동할 때마다 바깥 주소창의 ?path=를 따라가게 한다.
 *
 * 목업에서는 부모 주소창이 셸의 주소라 앱이 어느 화면인지 드러나지 않는다. 이 훅이
 * 그 간극을 메운다 — 주소창만 봐도 현재 화면을 알 수 있고, 그 URL을 복사하거나
 * 새로고침하면 같은 화면으로 다시 들어온다.
 *
 * pushState가 아니라 replaceState를 쓴다. iframe 안의 이동은 이미 브라우저 통합
 * 세션 히스토리에 쌓이므로, 바깥에서 또 쌓으면 뒤로가기가 한 화면당 두 번씩 먹는다.
 */
export function useIframePathSync(iframeRef: RefObject<HTMLIFrameElement | null>): void {
  useEffect(() => {
    let lastPath: string | null = null

    const sync = () => {
      let innerPath: string
      try {
        const location = iframeRef.current?.contentWindow?.location
        if (!location) return
        innerPath = `${location.pathname}${location.search}${location.hash}`
      } catch {
        // 다른 오리진을 띄운 경우. 목업은 같은 오리진만 쓰지만 방어적으로 넘어간다.
        return
      }

      // 갓 마운트된 iframe은 src를 불러오기 전 about:blank에 있고, 그 pathname은 'blank'다.
      // 걸러내지 않으면 로드 직전과 새로고침 직후마다 주소창에 ?path=blank가 스친다.
      if (!innerPath.startsWith('/')) return

      if (innerPath === lastPath) return
      lastPath = innerPath

      const outer = new URL(window.location.href)
      outer.searchParams.set('path', innerPath)
      // 슬래시는 쿼리 문자열에 그대로 써도 되는 문자다. 인코딩을 풀어 주소창을 읽을 수 있게 둔다.
      // 경로 안의 ?, &, #는 인코딩된 채로 남아야 하므로 %2F만 되돌린다.
      const query = outer.searchParams.toString().replaceAll('%2F', '/')

      window.history.replaceState(null, '', `${outer.pathname}?${query}${outer.hash}`)
    }

    sync()
    const timer = window.setInterval(sync, SYNC_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [iframeRef])
}
