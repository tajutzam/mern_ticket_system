import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { UserCheck, UserX, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useGetTechnicians, useUpdateTechStatusMutation } from "@/hooks/api/useTicketMutations";

export const Route = createFileRoute("/noc/technicians")({
  component: TechAvailability,
  head: () => ({ meta: [{ title: "Technical Availability — SIPATEN" }] }),
});

function TechAvailability() {
  const { data: techRes, isLoading, isError, error } = useGetTechnicians();
  const technicians = techRes?.data || [];
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateTechStatusMutation();

  const handleToggleStatus = (id: string, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Available" ? "Busy" : "Available";

    updateStatus(
      { id, status: nextStatus },
      {
        onSuccess: () => {
          toast.success(`Status ${name} berhasil diubah menjadi ${nextStatus}`);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || `Gagal mengubah status ${name}`);
        },
      }
    );
  };

  return (
    <AppLayout role="noc">
      <PageHeader
        title="Technical Availability Station"
        subtitle="Pantau beban kerja tim lapangan dan kelola status kesiapan petugas dispatch secara real-time."
      />

      <div className="p-8 max-w-4xl space-y-6">
        
        {/* HANDLING KONDISI LOADING JARINGAN */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-neutral-200 rounded-xl shadow-sm gap-2">
            <Loader2 className="h-6 w-6 text-[#36a7e3] animate-spin" />
            <p className="text-xs font-medium text-neutral-500">Menyinkronkan data ketersediaan tim lapangan...</p>
          </div>
        )}

        {/* HANDLING KONDISI ERROR JARINGAN */}
        {isError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl text-sm font-medium">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>Gagal memuat status tim: {error?.message || "Koneksi gateway API terputus."}</span>
          </div>
        )}

        {/* VIEW DATA TIM LAPANGAN */}
        {!isLoading && !isError && (
          <>
            {technicians.length === 0 ? (
              <div className="p-14 text-center text-sm text-neutral-400 font-medium bg-white border border-neutral-200 rounded-xl">
                Belum ada data user dengan role Technical yang terdaftar di dalam sistem.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {technicians.map((t: any) => {
                  const isAvailable = t.availabilityStatus === "Available";

                  return (
                    <Card 
                      key={t._id} 
                      className="p-5 flex items-center gap-4 border-neutral-200/80 shadow-sm bg-white rounded-xl transition-all hover:shadow-md"
                    >
                      {/* Avatar Indikator Status Kesiapan */}
                      <div
                        className={`h-11 w-11 rounded-xl grid place-items-center border shrink-0 transition-colors ${
                          isAvailable 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {isAvailable ? (
                          <UserCheck className="h-5 w-5" />
                        ) : (
                          <UserX className="h-5 w-5" />
                        )}
                      </div>

                      {/* Detail Profil Petugas */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-neutral-900 truncate" title={t.name}>
                          {t.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">
                          {t.availabilityStatus || "Available"}
                        </div>
                      </div>

                      {/* Sakelar Kendali Status */}
                      <Switch
                        checked={isAvailable}
                        disabled={isUpdating}
                        onCheckedChange={() => handleToggleStatus(t._id, t.name, t.availabilityStatus)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-neutral-200"
                      />
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}