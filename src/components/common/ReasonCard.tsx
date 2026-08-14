import Card from './Card';

interface Reason {
  label: string;
  value: string;
}

interface ReasonCardProps {
  title: string;
  reasons: Reason[];
  className?: string;
}

export default function ReasonCard({ title, reasons, className = '' }: ReasonCardProps) {
  return (
    <Card variant="store" className={`flex flex-col items-start gap-0.5 px-5 py-3.25 ${className}`}>
      <p className="w-full text-[15px] font-semibold leading-normal text-[#f2f2f2]">{title}</p>
      <ul className="w-full text-[12.5px] leading-normal text-[#a6a6a6]">
        {reasons.map((reason) => (
          <li key={reason.label}>
            · {reason.label} : {reason.value}
          </li>
        ))}
      </ul>
    </Card>
  );
}
