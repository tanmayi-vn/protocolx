// PriorityBadge: shared component for urgency labels
import type { Priority } from '../types';
import { AlertCircle, Info, Star } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
}

const ICONS = {
  urgent: <AlertCircle size={10} />,
  important: <Star size={10} />,
  awareness: <Info size={10} />,
};

const LABELS = {
  urgent: 'Urgent',
  important: 'Important',
  awareness: 'For Awareness',
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`priority-badge ${priority}`} aria-label={`Priority: ${LABELS[priority]}`}>
      {ICONS[priority]}
      {LABELS[priority]}
    </span>
  );
}
