interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function HeroImage({ src, alt, className = '' }: HeroImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={`aspect-338/163 w-full rounded-[15px] object-cover ${className}`}
    />
  );
}
