import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { useTickets } from "@/hooks/api/useTicketMutations";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Activity, AlertCircle, Wrench, Loader2 } from "lucide-react";

export const Route = createFileRoute("/noc/")({
  component: NocDashboard,
  head: () => ({ meta: [{ title: "NOC — Monitoring & Analysis" }] }),
});

function NocDashboard() {
  const { data: response, isLoading, isError, error } = useTickets();
  const tickets = response?.data || [];

  // Filter antrean tiket yang memerlukan perhatian tim NOC & Teknisi Lapangan
  const queue = tickets.filter((t) =>
    ["CONFIRMED", "ASSIGNED", "IN PROGRESS", "ON SITE"].includes(t.status)
  );

  // Perhitungan statistik real-time berdasarkan data backend
  const newCount = tickets.filter((t) => t.status === "CONFIRMED").length;
  const activeCount = tickets.filter((t) =>
    ["ASSIGNED", "IN PROGRESS", "ON SITE"].includes(t.status)
  ).length;

  return (
    <AppLayout role="noc">
      <PageHeader
        title="Monitoring & Analysis Workstation"
        subtitle="Analisis laporan jaringan dan delegasikan penugasan teknisi lapangan."
      />
      
      <div className="p-8 space-y-6">
        
        {/* TOP METRICS KINERJA JARINGAN */}
        <div className="grid md:grid-cols-3 gap-4">
          <Mini
            icon={<AlertCircle className="h-5 w-5" />}
            label="New Laporan (Confirmed)"
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
            label="Total Active Queue"
            value={queue.length}
            tone="primary"
          />
        </div>

        {/* LOGIKA KONDISIONAL APIS DATA FETCHING */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-neutral-200 rounded-xl shadow-sm gap-2">
            <Loader2 className="h-6 w-6 text-[#36a7e3] animate-spin" />
            <p className="text-xs font-medium text-neutral-500">Menghubungkan ke pusat pangkalan data tiket...</p>
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl text-sm font-medium">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>Gagal sinkronisasi data: {error?.message || "Koneksi ke gateway API terputus."}</span>
          </div>
        )}

        {/* TABEL DATA ANTREAN UTAMA */}
        {!isLoading && !isError && (
          <Card className="overflow-hidden border border-neutral-200/80 shadow-md rounded-xl">
            <div className="px-6 py-4 border-b border-neutral-100 bg-white">
              <h2 className="font-bold text-neutral-900 text-sm uppercase tracking-wider">Operational Ticket Queue</h2>
            </div>
            
            {queue.length === 0 ? (
              <div className="p-14 text-center text-sm text-neutral-400 font-medium bg-white">
                Tidak ada laporan kendala aktif di dalam antrean operasional NOC.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-400 font-semibold text-left">
                    <tr>
                      <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">ID Tiket</th>
                      <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">Customer</th>
                      <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">Kendala (Issue)</th>
                      <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">Kategori</th>
                      <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">Status Tracker</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {queue.map((t) => (
                      <tr key={t._id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-3.5 font-mono font-bold text-neutral-900">{t.ticketId}</td>
                        <td className="px-6 py-3.5 font-bold text-neutral-800">{t.customerName}</td>
                        {/* Menyelaraskan property t.title menjadi t.issueTitle */}
                        <td className="px-6 py-3.5 text-neutral-600 font-medium">{t.issueTitle}</td>
                        <td className="px-6 py-3.5 text-neutral-400 font-medium">{t.category}</td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          {/* Memperbaiki <a> menjadi <Link> TanStack Router dengan params _id MongoDB */}
                          <Link
                            to="/noc/tickets/$id"
                            params={{ id: t._id }}
                            className="text-xs font-extrabold transition-colors hover:underline"
                            style={{ color: "#36a7e3" }}
                          >
                            Analyze &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
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
    info: "bg-blue-50 text-[#36a7e3]",
    warning: "bg-amber-50 text-[#e8ae0c]",
    primary: "bg-neutral-900 text-neutral-100 shadow-sm",
  }[tone];

  return (
    <Card className="p-5 flex items-center gap-4 border-neutral-200/80 shadow-sm bg-white">
      <div className={`h-11 w-11 rounded-lg grid place-items-center ${cls}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-extrabold tracking-tight text-neutral-900 leading-none">{value}</div>
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-2 block">{label}</div>
      </div>
    </Card>
  );
}
