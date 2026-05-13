import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <Icon size={48} className="mx-auto mb-4 text-gray-600" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-4 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}
