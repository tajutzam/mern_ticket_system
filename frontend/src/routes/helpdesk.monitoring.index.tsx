import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { useSipaten } from "@/lib/sipaten-store";
import { TicketTable } from "./helpdesk.index";

export const Route = createFileRoute("/helpdesk/monitoring/")({
  component: Monitoring,
  head: () => ({ meta: [{ title: "Monitoring Ticket — SIPATEN" }] }),
});

function Monitoring() {
  const tickets = useSipaten((s) => s.tickets);
  return (
    <AppLayout role="helpdesk">
      <PageHeader
        title="Monitoring Ticket"
        subtitle="Semua ticket beserta status terkini."
      />
      <div className="p-8">
        <Card className="overflow-hidden">
          <TicketTable tickets={tickets} basePath="/helpdesk/monitoring" />
        </Card>
      </div>
    </AppLayout>
  );
}
