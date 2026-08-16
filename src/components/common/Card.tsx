import type { ReactNode } from 'react';

interface CardProps {
  variant?: 'product' | 'store';
  onSelect?: () => void;
  className?: string;
  children: ReactNode;
}

const SURFACE_STYLES = {
  product: 'bg-[#5c5c5c]/29',
  store: 'bg-[#d9d9d9]/20',
} as const;

export default function Card({ variant = 'product', onSelect, className = '', children }: CardProps) {
  const surfaceClassName = `w-full rounded-[15px] ${SURFACE_STYLES[variant]} ${className}`;

  // 선택 가능한 카드는 실제 button으로 렌더링해 터치 반응과 공통 누름 모션을 그대로 받는다.
  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className={`cursor-pointer text-left ${surfaceClassName}`}>
        {children}
      </button>
    );
  }

  return <div className={surfaceClassName}>{children}</div>;
}
