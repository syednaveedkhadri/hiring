import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/lib/db/candidates";

type CandidateStatusBadgeProps = {
  status: string;
  className?: string;
};

export function CandidateStatusBadge({ status, className }: CandidateStatusBadgeProps) {
  const variant = getStatusVariant(status);

  return (
    <Badge variant={variant} className={className}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
