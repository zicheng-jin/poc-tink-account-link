import { XCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorScreen({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  actionLabel = 'Try again',
  onAction,
}: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
        {onAction && (
          <Button onClick={onAction} variant="outline" className="w-full">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
