import { Loader2 } from 'lucide-react';

export default function Loading({ size = 32, text }: { size?: number; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 size={size} className="animate-spin text-primary-400" />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
}
