interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  message = 'Loading...',
  fullScreen = true,
}: LoadingSpinnerProps) {
  const wrapper = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={wrapper}>
      <div className="relative">
        {/* Outer ring */}
        <svg
          className="animate-spin-custom h-12 w-12 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
      {message && (
        <p className="mt-4 text-sm text-slate-500 font-medium">{message}</p>
      )}
    </div>
  );
}
