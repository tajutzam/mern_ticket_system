import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { useTickets } from "@/hooks/api/useTicketMutations";
import { AlertCircle, Loader2 } from "lucide-react";
import { TicketTable } from "@/components/TicketAble";

export const Route = createFileRoute("/helpdesk/monitoring/")({
  component: Monitoring,
  head: () => ({ meta: [{ title: "Monitoring Ticket — SIPATEN" }] }),
});

function Monitoring() {
  const { data: response, isLoading, isError, error } = useTickets();

  return (
    <AppLayout role="helpdesk">
      <PageHeader
        title="Monitoring Ticket"
        subtitle="Semua ticket beserta status terkini dari jaringan operasional."
      />
      <div className="p-8">
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-neutral-200 rounded-xl shadow-sm gap-3">
            <Loader2 className="h-7 w-7 text-[#36a7e3] animate-spin" />
            <p className="text-sm font-medium text-neutral-500">
              Sinkronisasi data tiket dengan database server...
              </p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-sm gap-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h4 className="font-bold text-sm">Gagal Sinkronisasi Data</h4>
            <p className="text-xs text-red-600 max-w-md font-medium">
              {error?.message || "Koneksi terputus atau server gagal merespons request data tiket."}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <Card className="overflow-hidden border border-neutral-200/80 shadow-md rounded-xl">
            <TicketTable 
              tickets={response?.data || []} 
            />
          </Card>
        )}
        
      </div>
    </AppLayout>
  );
}