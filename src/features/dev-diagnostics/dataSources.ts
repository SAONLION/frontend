export type DataSourceRow = {
  label: string
  live: boolean
}

/**
 * 주입된 구현이 Mock인지 비교한다.
 *
 * 호출부에서 `provider !== mockProvider`를 직접 쓰면 두 값이 같은 상수일 때 TypeScript가
 * 결과를 `false` 리터럴로 좁혀 버려서, Live로 교체한 뒤에도 비교문이 그대로 남는지 알기 어렵다.
 * 함수를 거치면 그런 좁힘 없이 실제 주입값을 그대로 비교한다.
 */
export function isLiveSource(injected: unknown, mock: unknown): boolean {
  return injected !== mock
}
