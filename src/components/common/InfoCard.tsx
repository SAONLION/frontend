import Card from './Card';

interface InfoCardProps {
  image: string;
  imageVariant?: 'cover' | 'primary-cutout';
  imageScale?: number;
  imageSurface?: 'white' | 'transparent';
  name: string;
  description: string | string[];
  variant?: 'product' | 'store';
  onSelect?: () => void;
  className?: string;
}

export default function InfoCard({
  image,
  imageVariant = 'cover',
  // Cutouts are pre-normalized to ~90% fill; the thumbnail clips overflow, so
  // anything above 1.1 crops the product edges.
  imageScale = 1,
  imageSurface = 'white',
  name,
  description,
  variant = 'product',
  onSelect,
  className = '',
}: InfoCardProps) {
  const descriptionText = Array.isArray(description) ? description.join(' · ') : description;

  return (
    <Card
      variant={variant}
      onSelect={onSelect}
      className={`flex h-20 items-center gap-3.25 px-3.75 ${className}`}
    >
      {imageVariant === 'primary-cutout' ? (
        <div className={`size-13.75 shrink-0 overflow-hidden rounded-lg ${imageSurface === 'white' ? 'bg-white' : 'bg-transparent'}`}>
          <img alt={name} className="size-full object-contain" decoding="async" loading="lazy" src={image} style={{ transform: `scale(${imageScale})` }} />
        </div>
      ) : (
        <img alt={name} className="size-13.75 shrink-0 rounded-lg object-cover" decoding="async" loading="lazy" src={image} />
      )}
      <div className="flex min-w-0 flex-1 flex-col items-start overflow-hidden">
        <p className="w-full truncate text-[15px] font-semibold leading-snug text-[#f2f2f2]">{name}</p>
        <p className="w-full truncate text-[12.5px] leading-normal text-[#a6a6a6]">{descriptionText}</p>
      </div>
    </Card>
  );
}
