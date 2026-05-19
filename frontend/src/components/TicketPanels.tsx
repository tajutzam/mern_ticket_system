import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import type { Ticket } from "@/lib/sipaten-store";
import { useSipaten } from "@/lib/sipaten-store";
import { MessageCircle, History, FileText, Paperclip } from "lucide-react";

export function TicketSummary({ ticket }: { ticket: Ticket }) {
  const tech = useSipaten((s) =>
    s.technicians.find((x) => x.id === ticket.assignedTo),
  );
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground font-mono">
            Ticket {ticket.id}
          </div>
          <h2 className="text-xl font-bold tracking-tight mt-1">
            {ticket.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {ticket.description || "—"}
          </p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mt-5 text-sm">
        <Field label="Customer" value={ticket.customerName} />
        <Field label="Phone" value={ticket.phone || "—"} />
        <Field label="Category" value={ticket.category} />
        <Field
          label="Created"
          value={format(new Date(ticket.createdAt), "dd MMM yyyy HH:mm")}
        />
        {tech && <Field label="Technician" value={tech.name} />}
        {ticket.priority && <Field label="Priority" value={ticket.priority} />}
      </div>
      {ticket.solution && (
        <div className="mt-5 rounded-md bg-success/10 border border-success/20 p-4 text-sm">
          <div className="font-medium text-success mb-1 flex items-center gap-1.5">
            <FileText className="h-4 w-4" /> Solution
          </div>
          <p className="text-foreground">{ticket.solution}</p>
          {ticket.evidence && (
            <p className="text-muted-foreground mt-2 flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5" /> {ticket.evidence}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}

export function ProgressTimeline({ ticket }: { ticket: Ticket }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Activity Timeline</h3>
      </div>
      <ol className="relative border-l border-border ml-2 space-y-4">
        {ticket.progress.map((p, i) => (
          <li key={i} className="ml-4">
            <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
            <div className="text-sm">{p.note}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {format(new Date(p.ts), "dd MMM HH:mm")} · {p.by}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function WhatsAppLog({ ticket }: { ticket: Ticket }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-4 w-4 text-success" />
        <h3 className="font-semibold">WhatsApp Log</h3>
      </div>
      {ticket.whatsapp.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada pesan terkirim.</p>
      ) : (
        <div className="space-y-3">
          {ticket.whatsapp.map((w, i) => (
            <div
              key={i}
              className="rounded-md bg-success/5 border border-success/15 p-3"
            >
              <div className="text-xs text-muted-foreground">
                To: <span className="font-medium text-foreground">{w.to}</span> ·{" "}
                {format(new Date(w.ts), "dd MMM HH:mm")}
              </div>
              <pre className="mt-1 text-sm whitespace-pre-wrap font-sans">
                {w.message}
              </pre>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
