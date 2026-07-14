interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

interface RangeRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  accentClassName?: string;
}

export function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
    >
      <span>{label}</span>
      <span
        className={`inline-flex h-5 w-9 items-center rounded-full border border-white/10 p-0.5 transition ${
          value ? "bg-emerald-400/80" : "bg-white/10"
        }`}
      >
        <span
          className={`h-3.5 w-3.5 rounded-full bg-white transition ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

export function RangeRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  accentClassName = "accent-fuchsia-400",
}: RangeRowProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={`w-full mt-2 ${accentClassName}`}
      />
    </div>
  );
}
