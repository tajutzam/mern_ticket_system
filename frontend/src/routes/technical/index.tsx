import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { useSipaten } from "@/lib/sipaten-store";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export const Route = createFileRoute("/technical/")({
  component: TechList,
  head: () => ({ meta: [{ title: "Assignment List — SIPATEN" }] }),
});

function TechList() {
  const tickets = useSipaten((s) => s.tickets);
  const technicians = useSipaten((s) => s.technicians);
  const [techId, setTechId] = useState(technicians[0]?.id ?? "TC1");

  const mine = tickets.filter(
    (t) =>
      t.assignedTo === techId &&
      ["ASSIGNED", "IN_PROGRESS", "ON_SITE"].includes(t.status),
  );
  const history = tickets.filter(
    (t) => t.assignedTo === techId && t.status === "CLOSED",
  );

  return (
    <AppLayout role="technical">
      <PageHeader
        title="Assignment List"
        subtitle="Lihat & kelola tugas lapangan."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Login as:</span>
            <Select value={techId} onValueChange={setTechId}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
      <div className="p-8 space-y-6">
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Active Assignments</h2>
          </div>
          <Table tickets={mine} empty="Tidak ada assignment aktif." />
        </Card>
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">History</h2>
          </div>
          <Table tickets={history} empty="Belum ada riwayat pekerjaan." />
        </Card>
      </div>
    </AppLayout>
  );
}

function Table({
  tickets,
  empty,
}: {
  tickets: ReturnType<typeof useSipaten.getState>["tickets"];
  empty: string;
}) {
  if (tickets.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        {empty}
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
            <th className="px-6 py-2.5 font-medium">Priority</th>
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
              <td className="px-6 py-3 text-muted-foreground">
                {t.priority ?? "—"}
              </td>
              <td className="px-6 py-3">
                <StatusBadge status={t.status} />
              </td>
              <td className="px-6 py-3 text-right">
                <a
                  href={`/technical/assignments/${t.id.replace("#", "")}`}
                  className="text-primary hover:underline"
                >
                  Open →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
