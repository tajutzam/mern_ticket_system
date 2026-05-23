import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
// Integrasikan hooks TanStack Query dari modul mutasi tiket Anda
import { useTicketDetail, useConfirmTicketMutation } from "@/hooks/api/useTicketMutations";
import { Button } from "@/components/ui/button";
import {
  TicketSummary,
  ProgressTimeline,
} from "@/components/TicketPanels";
import { toast } from "sonner";
import { CheckCircle2, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { WhatsAppLog } from "@/components/WhatsAppLog";

export const Route = createFileRoute("/helpdesk/monitoring/$id")({
  component: HelpdeskTicketDetail,
  head: () => ({ meta: [{ title: "Ticket Detail — SIPATEN" }] }),
});

function HelpdeskTicketDetail() {
  const { id } = useParams({ from: "/helpdesk/monitoring/$id" });
  const router = useRouter();

  const { data: response, isLoading, isError, error } = useTicketDetail(id);
  
  const { mutate: confirmTicket, isPending: isConfirming } = useConfirmTicketMutation();

  const ticket = response?.data;

  if (isLoading) {
    return (
      <AppLayout role="helpdesk">
        <PageHeader title="Memuat Data..." subtitle="Menghubungkan ke pusat server..." />
        <div className="p-8 flex items-center justify-center py-24">
          <Loader2 className="h-7 w-7 text-[#36a7e3] animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !ticket) {
    return (
      <AppLayout role="helpdesk">
        <PageHeader title="Tiket Tidak Ditemukan" />
        <div className="p-8 max-w-md mx-auto text-center space-y-4 pt-16">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 grid place-items-center mx-auto border border-red-100">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-sm text-neutral-500 font-medium">
            {error?.message || "ID Tiket tersebut tidak valid atau telah dihapus dari sistem."}
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.navigate({ to: "/helpdesk/monitoring" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Monitoring
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="helpdesk">
      <PageHeader
        title={`Ticket ${ticket.ticketId}`} // Menggunakan properti ticketId string (e.g., #TCK-...)
        subtitle={ticket.status === "OPEN" ? "Konfirmasi untuk meneruskan kendala ke tim NOC." : "Pantau perkembangan perbaikan tiket secara berkala."}
        actions={
          ticket.status === "OPEN" && (
            <Button
              disabled={isConfirming}
              onClick={() => {
                confirmTicket(ticket._id, {
                  onSuccess: () => {
                    toast.success("Tiket Berhasil Dikonfirmasi", {
                      description: "Langkah 5 Berhasil: Notifikasi otomatis WhatsApp terkirim ke customer.",
                    });
                  },
                });
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> 
              {isConfirming ? "Mengonfirmasi..." : "Confirm Ticket"}
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