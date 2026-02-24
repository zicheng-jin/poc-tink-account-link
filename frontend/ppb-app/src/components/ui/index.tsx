import { cn } from '@/lib/utils';
import { type ClassValue } from 'clsx';

// ---- Button ----
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="animate-spin-custom h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ---- Card ----
interface CardProps { children: React.ReactNode; className?: string }
export function Card({ children, className }: CardProps) {
  return <div className={cn('glass-card p-6', className)}>{children}</div>;
}
export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('mb-5', className)}>{children}</div>;
}
export function CardTitle({ children, className }: CardProps) {
  return <h3 className={cn('text-base font-semibold text-slate-900', className)}>{children}</h3>;
}
export function Separator({ className }: { className?: string }) {
  return <hr className={cn('border-t border-slate-100 my-4', className)} />;
}

// ---- Badge ----
interface BadgeProps { children: React.ReactNode; variant?: 'default' | 'secondary' | 'success' | 'outline' | 'blue' | 'amber' | 'violet'; className?: string }
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants: Record<string, ClassValue> = {
    default: 'bg-slate-900 text-white',
    secondary: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    outline: 'border border-slate-200 text-slate-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    violet: 'bg-violet-100 text-violet-700',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

// ---- Skeleton ----
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-slate-100 rounded-lg animate-pulse', className)} />;
}
