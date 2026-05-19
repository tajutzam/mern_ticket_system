import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { useSipaten } from "@/lib/sipaten-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { PlusCircle, Inbox, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/helpdesk/")({
  component: HelpdeskDashboard,
  head: () => ({ meta: [{ title: "Helpdesk Dashboard — SIPATEN" }] }),
});

function HelpdeskDashboard() {
  const tickets = useSipaten((s) => s.tickets);
  const open = tickets.filter((t) => t.status === "OPEN").length;
  const confirmed = tickets.filter(
    (t) => !["OPEN", "CLOSED", "RESOLVED"].includes(t.status),
  ).length;
  const closed = tickets.filter(
    (t) => t.status === "CLOSED" || t.status === "RESOLVED",
  ).length;

  return (
    <AppLayout role="helpdesk">
      <PageHeader
        title="Helpdesk Dashboard"
        subtitle="Kelola laporan customer dari awal sampai confirmation."
        actions={
          <Link to="/helpdesk/create">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" /> Create Ticket
            </Button>
          </Link>
        }
      />
      <div className="p-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Stat label="Open" value={open} icon={<Inbox className="h-5 w-5" />} tone="info" />
          <Stat
            label="In Progress"
            value={confirmed}
            icon={<ArrowRight className="h-5 w-5" />}
            tone="warning"
          />
          <Stat
            label="Closed / Resolved"
            value={closed}
            icon={<CheckCircle2 className="h-5 w-5" />}
            tone="success"
          />
        </div>

        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Recent Tickets</h2>
            <Link
              to="/helpdesk/monitoring"
              className="text-sm text-primary hover:underline"
            >
              Lihat semua
            </Link>
          </div>
          <TicketTable tickets={tickets.slice(0, 8)} />
        </Card>
      </div>
    </AppLayout>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "info" | "warning" | "success";
}) {
  const toneCls = {
    info: "bg-info/10 text-info",
    warning: "bg-warning/20 text-warning-foreground",
    success: "bg-success/10 text-success",
  }[tone];
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-lg grid place-items-center ${toneCls}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold leading-none">{value}</div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </div>
    </Card>
  );
}

export function TicketTable({
  tickets,
  basePath = "/helpdesk/monitoring",
}: {
  tickets: ReturnType<typeof useSipaten.getState>["tickets"];
  basePath?: string;
}) {
  if (tickets.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        Belum ada ticket. Klik <span className="font-medium">Create Ticket</span>{" "}
        untuk mulai.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr className="text-left">
            <th className="px-6 py-2.5 font-medium">ID</th>
            <th className="px-6 py-2.5 font-medium">Customer</th>
            <th className="px-6 py-2.5 font-medium">Issue</th>
            <th className="px-6 py-2.5 font-medium">Status</th>
            <th className="px-6 py-2.5 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className="border-t border-border">
              <td className="px-6 py-3 font-mono">{t.id}</td>
              <td className="px-6 py-3">{t.customerName}</td>
              <td className="px-6 py-3">{t.title}</td>
              <td className="px-6 py-3">
                <StatusBadge status={t.status} />
              </td>
              <td className="px-6 py-3 text-right">
                <a
                  href={`${basePath}/${t.id.replace("#", "")}`}
                  className="text-primary hover:underline text-sm"
                >
                  Detail →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
