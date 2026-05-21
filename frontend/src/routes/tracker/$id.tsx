import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { useTrackTicketPublic } from "@/hooks/api/useTicketMutations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import moment from "moment";

export const Route = createFileRoute("/tracker/$id")({
  component: PublicTicketTracker,
  head: () => ({ meta: [{ title: "Lacak Aduan Jaringan — SIPATEN" }] }),
});

function PublicTicketTracker() {
  const { id } = useParams({ from: "/tracker/$id" });
  const router = useRouter();

  // Fetch data tiket publik berdasarkan ticketId string dari URL
  const { data: response, isLoading, isError, error } = useTrackTicketPublic(id);
  const ticket = response?.data;

  // Pemetaan warna badge status penanganan yang bersih dan minimalis
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-50 text-[#36a7e3] border-blue-200";
      case "CONFIRMED":
      case "ASSIGNED":
      case "IN PROGRESS":
      case "ON SITE":
        return "bg-amber-50 text-[#e8ae0c] border-amber-200";
      case "CLOSED":
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-neutral-50 text-neutral-600 border-neutral-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-[#36a7e3] animate-spin" />
        <p className="text-sm font-semibold text-neutral-500">Mencari berkas aduan keluhan Anda...</p>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-6 text-center space-y-4 border-neutral-200 shadow-md bg-white rounded-xl">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 grid place-items-center mx-auto border border-red-100">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-neutral-900">ID Tiket Tidak Ditemukan</h3>
            <p className="text-xs font-medium text-neutral-400 leading-relaxed">
              {(error as any)?.response?.data?.message || "Format ID tiket yang Anda masukkan tidak valid atau tidak terdaftar."}
            </p>
          </div>
          <Button variant="outline" className="w-full font-bold" onClick={() => router.navigate({ to: "/" })}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Beranda
          </Button>
        </Card>
      </div>
    );
  }

  // Mengambil data array statusHistory dari model backend dan diurutkan dari yang terbaru (.reverse())
  const progressLogs = ticket.statusHistory || [];
  const sortedLogs = [...progressLogs].reverse();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-16">
      {/* HEADER STICKY BAR */}
      <header className="bg-white border-b border-neutral-200/80 px-8 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.navigate({ to: "/" })} className="rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-sm text-neutral-900">Ticket Tracking Station</h1>
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">SIPATEN Public Center</p>
            </div>
          </div>
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusStyle(ticket.status)}`}>
            Status: {ticket.status}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8 grid md:grid-cols-3 gap-6">
        {/* SIDEBAR DETAIL ADUAN TIKET (KIRI) */}
        <div className="space-y-4">
          <Card className="p-5 border-neutral-200 bg-white rounded-xl shadow-sm space-y-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Nomor Tiket</label>
              <div className="text-lg font-black text-neutral-900">#{ticket.ticketId}</div>
            </div>

            <div className="border-t border-neutral-100 pt-3">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Nama Pelanggan</label>
              <div className="text-sm font-bold text-neutral-800">{ticket.customerName}</div>
            </div>

            <div className="border-t border-neutral-100 pt-3">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Kategori & Masalah</label>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{ticket.category}</div>
              <div className="text-sm font-bold text-neutral-700 mt-0.5">{ticket.issueTitle}</div>
            </div>

            <div className="border-t border-neutral-100 pt-3">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Deskripsi Gangguan</label>
              <p className="text-xs font-medium text-neutral-500 mt-1 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                {ticket.description}
              </p>
            </div>

            <div className="border-t border-neutral-100 pt-3 text-[11px] font-medium text-neutral-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Dilaporkan: {moment(ticket.createdAt).format("DD MMM YYYY, HH:mm")}</span>
            </div>
          </Card>

          <div className="p-4 bg-blue-50/50 border border-blue-100 text-blue-900 rounded-xl space-y-1">
            <div className="text-xs font-bold flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#36a7e3]" /> Autentikasi Publik Aman
            </div>
            <p className="text-[10px] font-medium text-neutral-400 text-center leading-relaxed">
              Halaman pelacakan ini aman dan tidak menampilkan data pribadi sensitif seperti nomor telepon atau alamat lengkap demi privasi pengguna.
            </p>
          </div>
        </div>

        {/* LIVE TRACKING TIMELINE STATUS HISTORY (KANAN - LEBAR 2/3) */}
        <Card className="md:col-span-2 p-6 border-neutral-200 bg-white rounded-xl shadow-sm">
          <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#36a7e3]" /> Live Progress History
          </h3>

          {sortedLogs.length === 0 ? (
            <div className="py-12 text-center text-xs font-medium text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
              Belum ada riwayat update aktivitas penanganan pada tiket ini.
            </div>
          ) : (
            <div className="relative border-l-2 border-neutral-100 pl-6 ml-3 space-y-8">
              {sortedLogs.map((log: any, index: number) => {
                const isLatest = index === 0;

                return (
                  <div key={log._id || index} className="relative group">
                    {/* Lingkaran Titik Alur Penanda Kronologi */}
                    <span className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 grid place-items-center transition-transform ${
                      isLatest 
                        ? "bg-[#36a7e3] border-white ring-4 ring-blue-100 scale-110" 
                        : "bg-white border-neutral-300"
                    }`}>
                      {isLatest && <CheckCircle2 className="h-2 w-2 text-white" />}
                    </span>

                    {/* Informasi Log Pembaruan Status */}
                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className={`font-bold text-sm ${isLatest ? "text-neutral-900" : "text-neutral-700"}`}>
                          Status: {log.status} {log.updatedBy?.name ? `(${log.updatedBy.name})` : ""}
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">
                          {moment(log.updatedAt).format("DD MMM, HH:mm")}
                        </span>
                      </div>
                      
                      <p className="text-xs font-medium text-neutral-500 leading-relaxed pr-2">
                        {log.note || `Tiket telah diperbarui ke status ${log.status}.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}