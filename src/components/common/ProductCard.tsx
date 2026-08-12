interface ProductCardProps {
  image: string;
  name: string;
  description: string | string[];
  onSelect?: () => void;
  className?: string;
}

export default function ProductCard({ image, name, description, onSelect, className = '' }: ProductCardProps) {
  const descriptionText = Array.isArray(description) ? description.join(' · ') : description;

  return (
    <div
      onClick={onSelect}
      className={`flex h-20 w-full items-center gap-3.25 rounded-[15px] border-[0.6px] border-[#6b5f4c] bg-[#5c5c5c]/29 px-3.75 ${
        onSelect ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <img src={image} alt={name} className="size-13.75 shrink-0 rounded-lg object-cover" />
      <div className="flex min-w-0 flex-1 flex-col items-start overflow-hidden">
        <p className="w-full truncate text-[15px] font-semibold leading-snug text-[#f2f2f2]">{name}</p>
        <p className="w-full truncate text-[12.5px] leading-normal text-[#a6a6a6]">{descriptionText}</p>
      </div>
    </div>
  );
}
