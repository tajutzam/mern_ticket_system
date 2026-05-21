import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitWorkReportMutation } from "@/hooks/api/useAssignmentMutation";
import { useState } from "react";
import { ArrowLeft, FileText, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/technical/assignments/report/$id")({
  component: TechnicalWorkReportForm,
  head: () => ({ meta: [{ title: "Buat Laporan Kerja — SIPATEN" }] }),
});

const SOLUTION_COMPONENTS = [
  "Splicing / Penyambungan Core FO",
  "Penggantian Dropcore Kabel",
  "Penggantian Konektor Fast Connector",
  "Re-konfigurasi & Pembersihan ONT / Modem",
  "Penggantian Perangkat ONT / Modem Baru",
  "Perbaikan Jalur Kabel Distribusi (Bending)",
  "Lainnya (Tuliskan pada catatan)",
];

function TechnicalWorkReportForm() {
  const { id } = useParams({ from: "/technical/assignments/report/$id" });
  const router = useRouter();
  
  const { mutate: submitReport, isPending } = useSubmitWorkReportMutation();

  // State Formulir Laporan
  const [solution, setSolution] = useState("");
  const [finalNote, setFinalNote] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!solution || !finalNote.trim()) {
      toast.error("Jenis tindakan solusi dan catatan akhir wajib diisi.");
      return;
    }

    submitReport(
      {
        id,
        payload: { 
          solution, 
          finalNote, 
          evidenceUrl: evidenceUrl.trim() || undefined 
        },
      },
      {
        onSuccess: () => {
          toast.success("Laporan kerja berhasil diverifikasi. Berkas tiket dialihkan ke status CLOSED.");
          // Kembalikan teknisi ke halaman dashboard utama
          router.navigate({ to: "/technical" });
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Gagal mengirimkan laporan kerja.");
        },
      }
    );
  };

  return (
    <AppLayout role="technical">
      <PageHeader
        title="Closing Work Report"
        subtitle="Dokumentasikan hasil perbaikan fisik infrastruktur lapangan untuk menutup berkas penugasan."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.navigate({ to: "/technical/assignments/$id", params: { id } })}
            className="border-neutral-300 font-bold text-xs"
            disabled={isPending}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Batal
          </Button>
        }
      />

      <div className="p-8 max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {/* SISI FORM INPUT (KIRI - LEBAR 2/3) */}
        <div className="md:col-span-2">
          <Card className="p-6 border-neutral-200 bg-white rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* DROPDOWN KOMPONEN SOLUSI */}
              <div>
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-1.5">
                  Tindakan Perbaikan / Solusi *
                </label>
                <select
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  disabled={isPending}
                  className="w-full h-10 px-3 py-2 text-sm font-medium bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-950 disabled:bg-neutral-50"
                >
                  <option value="" disabled>-- Pilih Tindakan Solusi Lapangan --</option>
                  {SOLUTION_COMPONENTS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* CATATAN AKHIR JARINGAN */}
              <div>
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-1.5">
                  Catatan Akhir Lapangan *
                </label>
                <Textarea
                  placeholder="Jelaskan detail pengerjaan teknik Anda dan kondisi redaman akhir pasca perbaikan (Contoh: Kabel putus di tiang nomor 3 berhasil di-splicing ulang. Hasil ukur redaman OPM stabil di angka -19.2 dBm. Internet pelanggan sudah aktif kembali)."
                  value={finalNote}
                  onChange={(e) => setFinalNote(e.target.value)}
                  rows={5}
                  className="focus-visible:ring-neutral-950 border-neutral-300 text-sm font-medium leading-relaxed"
                  disabled={isPending}
                />
              </div>

              {/* URL BUKTI FISIK */}
              <div>
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-1.5">
                  URL Tautan Foto Bukti Dokumentasi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://storage.sipaten.id/evidence/img-102.jpg"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm font-medium bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-950 disabled:bg-neutral-50 placeholder:text-neutral-400"
                  disabled={isPending}
                />
              </div>

              {/* ACTION BUTTON */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs px-6 py-5"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Memverifikasi Berkas...
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5 mr-1.5" /> Kirim Laporan & Tutup Tiket
                    </>
                  )}
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* SIDEBAR EDUKASI OPERASIONAL (KANAN - LEBAR 1/3) */}
        <div className="space-y-4">
          <Card className="p-5 border-neutral-200 bg-amber-50/40 text-amber-900 rounded-xl space-y-3">
            <div className="text-xs font-bold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Konsekuensi Alur Kerja
            </div>
            <p className="text-[11px] font-medium text-neutral-500 leading-relaxed">
              Setelah menekan tombol **Submit**, sistem backend akan mengeksekusi otomatisasi data sebagai berikut:
            </p>
            <ul className="text-[11px] font-medium text-neutral-500 space-y-1.5 list-disc pl-4">
              <li>Status berkas aduan utama akan dikunci secara permanen menjadi <span className="font-bold text-neutral-800">CLOSED</span>.</li>
              <li>Status kesiapan akun Anda akan dikembalikan menjadi <span className="font-bold text-neutral-800">Available</span> di dashboard NOC agar Anda dapat menerima tugas berikutnya.</li>
              <li>Lini masa pelacakan publik milik customer akan langsung memuat detail tindakan solusi yang Anda isi.</li>
            </ul>
          </Card>
          
          <Card className="p-4 border-neutral-200 bg-white rounded-xl text-center flex items-center justify-center gap-2 text-[11px] font-bold text-neutral-400">
            <CheckCircle className="h-4 w-4 text-emerald-500" /> Secure Encryption Environment
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}