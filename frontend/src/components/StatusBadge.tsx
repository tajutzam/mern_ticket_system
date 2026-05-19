import { statusColor, statusLabel, type TicketStatus } from "@/lib/sipaten-store";

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[status]}`}
    >
      {statusLabel[status]}
    </span>
  );
}
