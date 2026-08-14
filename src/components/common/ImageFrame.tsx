interface ImageFrameProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageFrame({ src, alt, className = '' }: ImageFrameProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}
