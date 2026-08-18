import { defineConfig, type Plugin } from 'vite'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const BUILD_VERSION_PLACEHOLDER = '__BUILD_VERSION__'

/**
 * 서비스워커 캐시 이름에 빌드 버전을 주입한다.
 *
 * `public/sw.js`는 Vite가 그대로 복사하므로 번들 해시를 알 수 없다. 그래서 빌드가 끝난 뒤
 * 산출물 파일명(이미 콘텐츠 해시를 담고 있다)으로 버전을 만들어 placeholder를 치환한다.
 * 자산이 하나라도 바뀌면 버전이 바뀌고, 아무것도 안 바뀌면 그대로다 —
 * **배포 때 캐시 이름을 손으로 올리는 것을 잊어 옛 자산이 남는 사고를 막는다.**
 */
function serviceWorkerBuildVersion(): Plugin {
  let bundleVersion = 'dev'

  return {
    name: 'service-worker-build-version',
    apply: 'build',
    generateBundle(_options, bundle) {
      const fingerprint = Object.keys(bundle).sort().join('\n')
      bundleVersion = createHash('sha256').update(fingerprint).digest('hex').slice(0, 12)
    },
    async closeBundle() {
      const target = path.resolve('dist/sw.js')
      try {
        const source = await readFile(target, 'utf8')
        if (!source.includes(BUILD_VERSION_PLACEHOLDER)) {
          this.warn(`sw.js에 ${BUILD_VERSION_PLACEHOLDER}가 없어 캐시 버전을 주입하지 못했다.`)
          return
        }
        await writeFile(target, source.replaceAll(BUILD_VERSION_PLACEHOLDER, bundleVersion))
      } catch (error) {
        this.warn(`sw.js 캐시 버전 주입에 실패했다: ${String(error)}`)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorkerBuildVersion()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
