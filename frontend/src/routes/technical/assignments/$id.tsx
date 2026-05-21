import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetAssignmentDetail, useUpdateStatusMutation } from "@/hooks/api/useAssignmentMutation";
import { 
  MapPin, Phone, User, CheckCircle2, 
  Loader2, AlertCircle, ArrowLeft, Navigation, CheckCircle, 
  Wrench
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/technical/assignments/$id")({
  component: TechnicalAssignmentDetail,
  head: () => ({ meta: [{ title: "Detail Perintah Kerja — SIPATEN" }] }),
});

function TechnicalAssignmentDetail() {
  const { id } = useParams({ from: "/technical/assignments/$id" });
  const router = useRouter();

  const { data: res, isLoading, isError, error } = useGetAssignmentDetail(id);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateStatusMutation();

  const task = res?.data;

  const handleUpdateStatus = (targetStatus: "On Site" | "In Progress" | "Resolved") => {
    updateStatus(
      { id, status: targetStatus },
      {
        onSuccess: () => {
          toast.success(`Status penanganan berhasil diperbarui menjadi ${targetStatus}.`);
          if (targetStatus === "Resolved") {
            router.navigate({ 
              to: "/technical/assignments/report/$id", 
              params: { id } 
            });
          }
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Gagal memperbarui status operasional.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <AppLayout role="technical">
        <PageHeader title="Memuat Data..." />
        <div className="p-8 flex flex-col items-center justify-center py-32 gap-2">
          <Loader2 className="h-7 w-7 text-[#36a7e3] animate-spin" />
          <p className="text-xs font-medium text-neutral-500">Menghimpun berkas teknis lapangan...</p>
        </div>
      </AppLayout>
    );
  }

  if (isError || !task) {
    return (
      <AppLayout role="technical">
        <div className="p-8 max-w-xl mx-auto pt-16">
          <Card className="p-6 text-center space-y-4 border-neutral-200 shadow-md bg-white rounded-xl">
            <AlertCircle className="h-10 w-10 text-red-600 mx-auto" />
            <div>
              <h3 className="font-bold text-neutral-900">Gagal Memuat Lembar Kerja</h3>
              <p className="text-xs font-medium text-neutral-400 mt-1">
                {(error as any)?.response?.data?.message || "Surat penugasan tidak ditemukan atau akses ditolak."}
              </p>
            </div>
            <Button variant="outline" className="w-full font-bold" onClick={() => router.navigate({ to: "/technical" })}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Dashboard
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="technical">
      <PageHeader
        title={`Worksheet ${task.ticketId?.ticketId || "N/A"}`}
        subtitle="Kelola kemajuan perbaikan fisik infrastruktur pelanggan langsung di lokasi."
        actions={
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.navigate({ to: "/technical" })}
            className="border-neutral-300 font-bold text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Kembali
          </Button>
        }
      />

      <div className="p-8 max-w-5xl grid md:grid-cols-3 gap-6">
        
        {/* PANEL ACTIONS & UTILITIES */}
        <div className="space-y-4">
          <Card className="p-5 border-neutral-200 bg-white rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">Aksi Alur Kerja</h3>
            
            <div className="flex flex-col gap-2.5">
              {task.status === "Accepted" && (
                <Button
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus("On Site")}
                  className="w-full bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs py-5"
                >
                  <MapPin className="h-4 w-4 mr-2" /> Saya Sudah Sampai (On Site)
                </Button>
              )}

              {task.status === "On Site" && (
                <Button
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus("In Progress")}
                  className="w-full bg-[#e8ae0c] text-neutral-950 hover:bg-[#d49f0a] font-bold text-xs py-5"
                >
                  <Wrench className="h-4 w-4 mr-2" /> Mulai Eksekusi Perbaikan
                </Button>
              )}

              {task.status === "In Progress" && (
                <Button
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus("Resolved")}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs py-5"
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Selesaikan Penanganan (Resolved)
                </Button>
              )}

              {["Resolved", "Completed"].includes(task.status) && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-center text-emerald-600 bg-emerald-50 border border-emerald-100 py-3 rounded-lg flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Masalah Telah Di-Resolve
                  </div>
                  {task.status === "Resolved" && (
                    <Button
                      onClick={() => router.navigate({ to: "/technical/assignments/report/$id", params: { id } })}
                      className="w-full bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs"
                    >
                      Isi Laporan Kerja Akhir
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* KARTU HUBUNGI PELANGGAN */}
          <Card className="p-5 border-neutral-200 bg-white rounded-xl shadow-sm space-y-3">
            <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">Kontak Pelanggan</h3>
            <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
              <div className="h-9 w-9 bg-neutral-200 text-neutral-700 rounded-full grid place-items-center shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-neutral-800 truncate">{task.ticketId?.customerName}</div>
                <div className="text-[11px] font-medium text-neutral-400 mt-0.5">{task.ticketId?.phoneNumber}</div>
              </div>
            </div>
            <a 
              href={`https://wa.me/${task.ticketId?.phoneNumber?.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full font-bold text-xs border-neutral-300 text-neutral-700">
                <Phone className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Kontak via WhatsApp
              </Button>
            </a>
          </Card>
        </div>

        {/* PANEL DETAIL INFORMASI */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-6 border-neutral-200 bg-white rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wider">Detail Kendala Teknis</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-100 border text-neutral-500 rounded-md">
                Status Tugas: {task.status}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <span className="text-neutral-400 block font-bold text-[10px] uppercase tracking-wider">Kategori Layanan</span>
                <span className="text-neutral-800 font-bold block mt-0.5">{task.ticketId?.category}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-bold text-[10px] uppercase tracking-wider">Judul Gangguan</span>
                <span className="text-neutral-800 font-bold block mt-0.5">{task.ticketId?.issueTitle}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-neutral-400 block font-bold text-[10px] uppercase tracking-wider">Deskripsi Keluhan</span>
              <p className="text-xs font-medium text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100 mt-1 leading-relaxed">
                {task.ticketId?.description}
              </p>
            </div>

            <div className="pt-2">
              <span className="text-neutral-400 block font-bold text-[10px] uppercase tracking-wider">Instruksi Tim NOC Pusat</span>
              <p className="text-xs font-bold text-neutral-700 bg-amber-50/60 p-3 rounded-lg border border-amber-100 mt-1 leading-relaxed">
                {task.note || "Tidak ada catatan instruksi spesifik."}
              </p>
            </div>
          </Card>

          {/* LOKASI & NAVIGASI */}
          <Card className="p-6 border-neutral-200 bg-white rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#36a7e3]" /> Alamat Penanganan On Site
              </h2>
            </div>

            <div className="flex gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              <MapPin className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" />
              <div className="text-xs font-medium text-neutral-600 leading-relaxed">
                {task.ticketId?.address || "Data alamat lengkap pelanggan tersemat di sistem registrasi Helpdesk / CRM Utama."}
              </div>
            </div>

            {task.ticketId?.address && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.ticketId.address)}`}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button className="w-full bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs">
                  <Navigation className="h-4 w-4 mr-2" /> Buka Navigasi Google Maps
                </Button>
              </a>
            )}
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}