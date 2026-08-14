import type { ReactNode } from 'react';

interface CardProps {
  variant?: 'product' | 'store';
  onSelect?: () => void;
  className?: string;
  children: ReactNode;
}

const SURFACE_STYLES = {
  product: 'border-[#6b5f4c] bg-[#5c5c5c]/29',
  store: 'border-[#424242] bg-[#d9d9d9]/20',
} as const;

export default function Card({ variant = 'product', onSelect, className = '', children }: CardProps) {
  return (
    <div
      onClick={onSelect}
      className={`liquid-glass-card w-full rounded-[15px] border-[0.6px] ${SURFACE_STYLES[variant]} ${
        onSelect ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
