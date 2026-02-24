import { cn } from '@/lib/utils';
import type { PaymentMode } from '@/store/checkoutStore';

interface ModeSelectorProps {
  value: PaymentMode;
  onChange: (mode: PaymentMode) => void;
}

const modes: { value: PaymentMode; label: string; description: string }[] = [
  {
    value: 'iframe',
    label: 'Iframe',
    description: 'Full in-page experience using nested iframes',
  },
  {
    value: 'redirect',
    label: 'Redirect',
    description: 'Full-page redirect to bank and back',
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
    description: 'Iframe for bank selection, redirect for auth',
  },
];

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
        Integration Mode
      </p>
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={cn(
              'flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150',
              value === mode.value
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-slate-400">
        {modes.find((m) => m.value === value)?.description}
      </p>
    </div>
  );
}
