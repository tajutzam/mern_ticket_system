import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import type { Ticket } from "@/api/ticket";
import { MessageCircle, History, FileText, Paperclip, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/axiosInstance";

export function TicketSummary({ ticket }: { ticket: Ticket }) {
  const { data: assignmentResponse } = useQuery({
    queryKey: ["assignment", ticket._id],
    queryFn: async () => {
      try {
        const res = await api.get(`/assignments/ticket/${ticket._id}`);
        return res.data;
      } catch {
        return null; // Fallback jika belum ada assignment (Case A)
      }
    },
    enabled: !!ticket._id,
  });

  const assignment = assignmentResponse?.data;
  const technicianName = assignment?.technician?.name;
  const workReport = assignment?.workReport;

  return (
    <Card className="p-6 border-neutral-200/80 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground font-mono">
            Ticket {ticket.ticketId}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 mt-1">
            {ticket.issueTitle}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {ticket.description || "—"}
          </p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-neutral-100 text-sm">
        <Field label="Customer" value={ticket.customerName} />
        <Field label="Phone" value={ticket.phoneNumber || "—"} />
        <Field label="Category" value={ticket.category} />
        <Field
          label="Created At"
          value={ticket.createdAt ? format(new Date(ticket.createdAt), "dd MMM yyyy HH:mm") : "—"}
        />
        {technicianName && <Field label="Assigned Technician" value={technicianName} />}
        {assignment?.priority && <Field label="Assignment Priority" value={assignment.priority} />}
      </div>

      {workReport?.solution && (
        <div className="mt-5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 p-4 text-sm">
          <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-emerald-600" /> Solusi Perbaikan
          </div>
          <p className="text-neutral-700 font-medium">{workReport.solution}</p>
          {workReport.finalNote && (
            <p className="text-xs text-neutral-500 mt-1">Catatan: {workReport.finalNote}</p>
          )}
          {workReport.evidenceUrl && (
            <div className="mt-3">
              <a 
                href={workReport.evidenceUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-[#36a7e3] hover:underline inline-flex items-center gap-1"
              >
                <Paperclip className="h-3.5 w-3.5" /> Lihat Lampiran Bukti Kerja
              </a>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{label}</div>
      <div className="font-bold text-neutral-800 mt-0.5">{value}</div>
    </div>
  );
}

export function ProgressTimeline({ ticket }: { ticket: Ticket }) {
  const historyList = ticket.statusHistory || [];

  return (
    <Card className="p-6 border-neutral-200/80 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <History className="h-4 w-4 text-neutral-500" />
        <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wider">Activity Log Timeline</h3>
      </div>
      
      {historyList.length === 0 ? (
        <p className="text-xs text-neutral-400 font-medium">Belum ada rekaman jejak aktivitas.</p>
      ) : (
        <ol className="relative border-l border-neutral-200 ml-2 space-y-5">
          {historyList.map((p, i) => {
            console.log(p)
            const operatorName = typeof p.updatedBy === "object" && p.updatedBy !== null 
              ? (p.updatedBy as any).name 
              : "System Operator";

            const operatorRole = typeof p.updatedBy === "object" && p.updatedBy !== null 
              ? ` (${(p.updatedBy as any).role})` 
              : "";

            return (
              <li key={i} className="ml-4 relative">
                <div className="absolute -left-[22px] top-1 h-3 w-3 rounded-full bg-white border-2 border-[#36a7e3] ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 border border-neutral-200">
                    {p.status}
                  </span>
                </div>
                <div className="text-sm font-semibold text-neutral-700 mt-1.5">{p.note}</div>
                <div className="text-[11px] font-medium text-neutral-400 mt-0.5 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {format(new Date(p.updatedAt || Date.now()), "dd MMM HH:mm")} &bull; {operatorName}{operatorRole}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
