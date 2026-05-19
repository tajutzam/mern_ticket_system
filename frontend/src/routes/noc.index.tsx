import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { useSipaten } from "@/lib/sipaten-store";
import { StatusBadge } from "@/components/StatusBadge";
import { Activity, AlertCircle, Wrench } from "lucide-react";

export const Route = createFileRoute("/noc/")({
  component: NocDashboard,
  head: () => ({ meta: [{ title: "NOC — Monitoring & Analysis" }] }),
});

function NocDashboard() {
  const tickets = useSipaten((s) => s.tickets);
  const queue = tickets.filter((t) =>
    ["CONFIRMED", "ASSIGNED", "IN_PROGRESS", "ON_SITE"].includes(t.status),
  );
  const newCount = tickets.filter((t) => t.status === "CONFIRMED").length;
  const activeCount = tickets.filter((t) =>
    ["ASSIGNED", "IN_PROGRESS", "ON_SITE"].includes(t.status),
  ).length;

  return (
    <AppLayout role="noc">
      <PageHeader
        title="Monitoring & Analysis"
        subtitle="Ticket yang siap dianalisa dan ditugaskan."
      />
      <div className="p-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Mini
            icon={<AlertCircle className="h-5 w-5" />}
            label="New (Confirmed)"
            value={newCount}
            tone="warning"
          />
          <Mini
            icon={<Wrench className="h-5 w-5" />}
            label="Active Field Work"
            value={activeCount}
            tone="info"
          />
          <Mini
            icon={<Activity className="h-5 w-5" />}
            label="Total in Queue"
            value={queue.length}
            tone="primary"
          />
        </div>

        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Ticket Queue</h2>
          </div>
          {queue.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Tidak ada ticket dalam queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr className="text-left">
                    <th className="px-6 py-2.5 font-medium">ID</th>
                    <th className="px-6 py-2.5 font-medium">Customer</th>
                    <th className="px-6 py-2.5 font-medium">Issue</th>
                    <th className="px-6 py-2.5 font-medium">Category</th>
                    <th className="px-6 py-2.5 font-medium">Status</th>
                    <th className="px-6 py-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((t) => (
                    <tr key={t.id} className="border-t border-border">
                      <td className="px-6 py-3 font-mono">{t.id}</td>
                      <td className="px-6 py-3">{t.customerName}</td>
                      <td className="px-6 py-3">{t.title}</td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {t.category}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <a
                          href={`/noc/tickets/${t.id.replace("#", "")}`}
                          className="text-primary hover:underline"
                        >
                          Analyze →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

function Mini({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "info" | "warning" | "primary";
}) {
  const cls = {
    info: "bg-info/10 text-info",
    warning: "bg-warning/20 text-warning-foreground",
    primary: "bg-primary/10 text-primary",
  }[tone];
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-lg grid place-items-center ${cls}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold leading-none">{value}</div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </div>
    </Card>
  );
}
