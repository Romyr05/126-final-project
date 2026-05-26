import { Star } from "lucide-react";

type StatBoxProps = {
  label: string;
  value: string | number;
  showStar?: boolean
};

export default function StatBox({
  label,
  value,
  showStar = false
}: StatBoxProps) {
  return (
    <div className="flex h-20 min-w-28 flex-col items-center justify-center rounded-md border border-[var(--vault-border)] bg-[var(--vault-bg-soft)] px-5 text-center md:min-w-32">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--vault-purple)]">
        {label}
      </p>
      <p className="mt-1 text-3xl font-black leading-none text-[var(--vault-text)]">
        {value}
        {showStar && (
          <Star
            className="ml-1 inline h-5 w-5 align-middle text-[var(--vault-purple)]"
            fill="currentColor"
          />
        )}
      </p>
    </div>
  );
}
