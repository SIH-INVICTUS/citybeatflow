import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type IssueStatus = 'pending' | 'verified' | 'in-progress' | 'resolved' | 'rejected';

interface StatusBadgeProps {
  status?: IssueStatus | string;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending Review',
    className: 'bg-status-pending text-foreground',
  },
  verified: {
    label: 'Verified',
    className: 'bg-status-verified text-primary-foreground',
  },
  'in-progress': {
    label: 'In Progress',
    className: 'bg-status-progress text-primary-foreground',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-status-resolved text-primary-foreground',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-status-rejected text-destructive-foreground',
  },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = (status && (statusConfig as any)[status]) || { label: String(status ?? 'Unknown'), className: 'bg-muted text-foreground' };

  return (
    <Badge
      className={cn(
        'px-2 py-1 text-xs font-medium border-0',
        (config && config.className) || 'bg-muted text-foreground',
        className
      )}
    >
      {config && config.label ? config.label : String(status ?? 'Unknown')}
    </Badge>
  );
};

export default StatusBadge;