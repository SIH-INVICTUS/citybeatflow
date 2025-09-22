import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type IssueStatus = 'pending' | 'verified' | 'in-progress' | 'resolved' | 'rejected';

interface StatusBadgeProps {
  status: IssueStatus;
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
  const config = statusConfig[status];
  
  return (
    <Badge 
      className={cn(
        'px-2 py-1 text-xs font-medium border-0',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;