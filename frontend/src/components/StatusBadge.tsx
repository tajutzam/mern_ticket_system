import { StatusHistory } from "@/api/ticket";

type TicketStatus = StatusHistory["status"];

const statusColor: Record<TicketStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 border border-blue-200",
  CONFIRMED: "bg-amber-50 text-amber-700 border border-amber-200",
  ASSIGNED: "bg-purple-50 text-purple-700 border border-purple-200",
  "IN PROGRESS": "bg-indigo-50 text-indigo-700 border border-indigo-200",
  "ON SITE": "bg-sky-50 text-sky-700 border border-sky-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CLOSED: "bg-neutral-100 text-neutral-700 border border-neutral-300",
};

const statusLabel: Record<TicketStatus, string> = {
  OPEN: "Open",
  CONFIRMED: "Confirmed",
  ASSIGNED: "Assigned",
  "IN PROGRESS": "In Progress",
  "ON SITE": "On Site",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors shadow-sm ${statusColor[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full mr-1.5 animate-pulse" style={{
        backgroundColor: status === "CONFIRMED" ? "#e8ae0c" : status === "OPEN" || status === "ON SITE" ? "#36a7e3" : "currentColor"
      }} />
      {statusLabel[status]}
    </span>
  );
}