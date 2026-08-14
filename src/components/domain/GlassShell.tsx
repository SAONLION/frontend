import type { PropsWithChildren, ReactNode } from 'react';
import backgroundImage from '../../assets/images/stage-a-background.png';

// StageC 상세 화면들이 공유하는 프로스티드 글래스 카드 셸. 앱 전체와 톤을
// 맞추기 위해 dev 원본의 별도 액센트(#b87420) 대신 기존 PRIMARY_BG 계열
// 색상을 그대로 쓴다.
export function StageCDetailShell({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className={`relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col gap-3.25 px-6 pt-12 pb-8 ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function GlassTopBar({ context, action, className = '' }: { context: string; action: ReactNode; className?: string }) {
  return (
    <header className={`flex items-center justify-between text-[14px] text-white ${className}`}>
      {context && <span>{context}</span>}
      {action}
    </header>
  );
}

export function GlassInfoCard({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`rounded-[15px] border-[0.6px] border-white/18 bg-[#1c1f26]/70 p-5 text-white backdrop-blur-md ${className}`}>
      {children}
    </section>
  );
}

export function GlassSpeechBubble({ children }: PropsWithChildren) {
  return (
    <div className="rounded-[15px] border-[0.6px] border-white/18 bg-[#26292f]/80 px-4 py-3 text-center text-[13px] text-[#d1d1d1] backdrop-blur-md">
      {children}
    </div>
  );
}

export function GlassBottomActionDock({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <footer className={`mt-auto flex w-full flex-col gap-2.75 ${className}`}>{children}</footer>;
}

interface GlassChoiceChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  swatch?: string;
}

export function GlassChoiceChip({ label, selected, onClick, swatch }: GlassChoiceChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border-[0.6px] px-4 py-2 text-[13px] transition ${
        selected ? 'border-[#8a5111] bg-[#8a5111]/25 text-white' : 'border-white/18 bg-white/5 text-[#d1d1d1]'
      }`}
    >
      {swatch && <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: swatch }} />}
      <span>{label}</span>
    </button>
  );
}
