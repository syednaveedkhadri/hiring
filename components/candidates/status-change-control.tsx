"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCandidateStatus } from "@/app/candidates/actions";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "NEW", label: "New" },
  { value: "SCREENING", label: "Screening" },
  { value: "INTERVIEWED", label: "Interviewed" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "SELECTED", label: "Selected" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ON_HOLD", label: "On Hold" },
];

type StatusChangeControlProps = {
  candidateId: string;
  currentStatus: string;
};

export function StatusChangeControl({
  candidateId,
  currentStatus,
}: StatusChangeControlProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    startTransition(async () => {
      try {
        const result = await updateCandidateStatus(candidateId, newStatus);

        if (result.success) {
          router.refresh();
        } else {
          alert(result.error || "Failed to update status");
        }
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update status");
      }
    });
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
