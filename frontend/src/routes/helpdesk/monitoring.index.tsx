import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { useTickets } from "@/hooks/api/useTicketMutations";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { TicketTable } from "@/components/TicketAble";

export const Route = createFileRoute("/helpdesk/monitoring/")({
  component: HelpdeskMonitoringDashboard,
});

function HelpdeskMonitoringDashboard() {
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: response, isLoading, isFetching } = useTickets(page, limit);
  
  const tickets = response?.data || [];
  const meta = response?.pagination;

  return (
    <AppLayout role="helpdesk">
      <PageHeader 
        title="Monitoring System" 
        subtitle="Pantau dan kelola seluruh antrean keluhan jaringan pelanggan secara real-time."
        actions={
          isFetching && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
        }
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {isLoading ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#36a7e3]" />
          </div>
        ) : (
          <>
            {/* CONTAINER TABEL INTEGRASI PREMIUM */}
            <div className="bg-white border border-neutral-200/60 rounded-xl overflow-hidden shadow-sm">
              <TicketTable tickets={tickets} />
            </div>

            {/* CONTROLLER PAGINATION BAR PREMIUM */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between border border-neutral-200/50 bg-white px-5 py-3 rounded-xl shadow-sm">
                <div className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">
                  Showing Page {meta.currentPage} of {meta.totalPages} ({meta.totalResults} Total Tickets)
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((old) => Math.max(old - 1, 1))}
                    disabled={!meta.hasPrevPage}
                    className="h-8 border-neutral-300 font-bold text-xs uppercase text-neutral-600 disabled:opacity-40 px-3"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((old) => (meta.hasNextPage ? old + 1 : old))}
                    disabled={!meta.hasNextPage}
                    className="h-8 border-neutral-300 font-bold text-xs uppercase text-neutral-600 disabled:opacity-40 px-3"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}