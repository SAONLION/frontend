import type { PropsWithChildren } from 'react'

export function MobileShell({ children }: PropsWithChildren) {
  return <main className="stage-c-shell">{children}</main>
}
