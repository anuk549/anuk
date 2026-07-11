export default function Loading({ className = 'min-h-screen' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className} bg-[var(--bg)] text-[var(--fg)]`}>
      <span className="font-heading text-3xl italic">anuk.h</span>
      <div className="flex gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent-2)]" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--fg)]" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}