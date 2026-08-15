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
  return (
    <div
      onClick={onSelect}
      className={`w-full rounded-[15px] ${SURFACE_STYLES[variant]} ${
        onSelect ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
