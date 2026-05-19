import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { useSipaten } from "@/lib/sipaten-store";
import { Button } from "@/components/ui/button";
import {
  TicketSummary,
  ProgressTimeline,
  WhatsAppLog,
} from "@/components/TicketPanels";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/helpdesk/monitoring/$id")({
  component: HelpdeskTicketDetail,
  head: () => ({ meta: [{ title: "Ticket Detail — SIPATEN" }] }),
});

function HelpdeskTicketDetail() {
  const { id } = useParams({ from: "/helpdesk/monitoring/$id" });
  const router = useRouter();
  const ticket = useSipaten((s) =>
    s.tickets.find((t) => t.id === `#${id}`),
  );
  const confirmTicket = useSipaten((s) => s.confirmTicket);

  if (!ticket) {
    return (
      <AppLayout role="helpdesk">
        <PageHeader title="Ticket not found" />
        <div className="p-8">
          <Button onClick={() => router.navigate({ to: "/helpdesk" })}>
            Back to dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="helpdesk">
      <PageHeader
        title={`Ticket ${ticket.id}`}
        subtitle={ticket.status === "OPEN" ? "Konfirmasi untuk meneruskan ke NOC." : "Pantau perkembangan ticket."}
        actions={
          ticket.status === "OPEN" && (
            <Button
              onClick={() => {
                confirmTicket(ticket.id);
                toast.success("Ticket confirmed", {
                  description: "WhatsApp notifikasi terkirim ke customer.",
                });
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Ticket
            </Button>
          )
        }
      />
      <div className="p-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TicketSummary ticket={ticket} />
          <ProgressTimeline ticket={ticket} />
        </div>
        <div className="space-y-6">
          <WhatsAppLog ticket={ticket} />
        </div>
      </div>
    </AppLayout>
  );
}
