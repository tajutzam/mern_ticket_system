import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/api/axiosInstance";
import { useState } from "react";
import { 
  Clock, Wrench, CheckCircle2, AlertCircle, 
  Loader2, ArrowRight, XCircle, FileText, ExternalLink, MapPin, User, ShieldAlert 
} from "lucide-react";
import moment from "moment";
import { toast } from "sonner";
import { useAcceptAssignmentMutation, useGetMyAssignments, useGetAssignmentDetail } from "@/hooks/api/useAssignmentMutation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/technical/")({
  component: TechnicalDashboard,
  head: () => ({ meta: [{ title: "Technical Dashboard — SIPATEN" }] }),
});

function TechnicalDashboard() {
  const [activeTab, setActiveTab] = useState<"assigned" | "active" | "history">("assigned");
  const { data: res, isLoading, isError, error } = useGetMyAssignments();
  const { mutate: acceptTask, isPending: isAccepting } = useAcceptAssignmentMutation();

  const assignments = res?.data || [];

  // Pemisahan data berdasarkan status operasional lapangan
  const assignedTasks = assignments.filter((a: any) => a.status === "Pending");
  const activeTasks = assignments.filter((a: any) => ["Accepted", "In Progress", "On Site", "Resolved"].includes(a.status));
  const historyTasks = assignments.filter((a: any) => ["Completed", "Canceled"].includes(a.status));

  const handleAccept = (id: string, ticketId: string) => {
    acceptTask(id, {
      onSuccess: () => {
        toast.success(`Tugas untuk tiket #${ticketId} berhasil diterima.`);
        setActiveTab("active");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Gagal menyetujui perintah kerja.");
      },
    });
  };

  return (
    <AppLayout role="technical">
      <PageHeader
        title="Technical Assignment Board"
        subtitle="Pusat kendali tugas perbaikan lapangan dan pelaporan bukti penanganan."
      />

      <div className="p-8 space-y-6 max-w-5xl">
        {/* TABS CONTROLLER */}
        <div className="flex border-b border-neutral-200 gap-2 shrink-0">
          <TabButton
            active={activeTab === "assigned"}
            label={`Tugas Baru (${assignedTasks.length})`}
            onClick={() => setActiveTab("assigned")}
          />
          <TabButton
            active={activeTab === "active"}
            label={`Sedang Berjalan (${activeTasks.length})`}
            onClick={() => setActiveTab("active")}
          />
          <TabButton
            active={activeTab === "history"}
            label={`Riwayat Selesai (${historyTasks.length})`}
            onClick={() => setActiveTab("history")}
          />
        </div>

        {/* LOADING & ERROR HANDLING */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-neutral-200 rounded-xl gap-2 shadow-sm">
            <Loader2 className="h-6 w-6 text-[#36a7e3] animate-spin" />
            <p className="text-xs font-medium text-neutral-500">Sinkronisasi lembar tugas lapangan...</p>
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl text-sm font-medium">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>Gagal memuat daftar perintah kerja: {error?.message || "Koneksi terputus."}</span>
          </div>
        )}

        {/* LIST TUGAS BERDASARKAN TAB */}
        {!isLoading && !isError && (
          <>
            {activeTab === "assigned" && (
              <TasksGrid
                tasks={assignedTasks}
                emptyMessage="Tidak ada surat tugas baru untuk Anda saat ini."
                renderActions={(task) => (
                  <Button
                    disabled={isAccepting}
                    onClick={() => handleAccept(task._id, task.ticketId?.ticketId)}
                    className="w-full bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs"
                  >
                    Accept & Ambil Tugas
                  </Button>
                )}
              />
            )}

            {activeTab === "active" && (
              <TasksGrid
                tasks={activeTasks}
                emptyMessage="Tidak ada pekerjaan lapangan yang sedang aktif berjalan."
                renderActions={(task) => (
                  <Link
                    to="/technical/assignments/$id"
                    params={{ id: task._id }}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full font-bold text-xs border-neutral-300">
                      Buka Lembar Kerja <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                )}
              />
            )}

            {activeTab === "history" && (
              <TasksGrid
                tasks={historyTasks}
                emptyMessage="Belum ada riwayat penugasan di dalam arsip data Anda."
                renderActions={(task) => (
                  <div className="flex items-center gap-2">
                    {task.status === "Completed" ? (
                      <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 py-1.5 px-3 rounded-lg text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Selesai
                      </div>
                    ) : (
                      <div className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 py-1.5 px-3 rounded-lg text-center flex items-center justify-center gap-1">
                        <XCircle className="h-3.5 w-3.5 shrink-0" /> Batal
                      </div>
                    )}

                    {/* MODAL DETAL DATA DINAMIS LAZY FETCH */}
                    <HistoryDetailModal assignmentId={task._id} ticketIdString={task.ticketId?.ticketId} />
                  </div>
                )}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

// SUB KOMPONEN GRID KARTU TUGAS
function TasksGrid({ tasks, emptyMessage, renderActions }: { tasks: any[]; emptyMessage: string; renderActions: (task: any) => React.ReactNode }) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-50 text-red-700 border-red-200";
      case "High": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Medium": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-neutral-50 text-neutral-600 border-neutral-200";
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="p-14 text-center text-sm text-neutral-400 font-medium bg-white border border-neutral-200 rounded-xl">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {tasks.map((task) => (
        <Card key={task._id} className="p-5 border-neutral-200 shadow-sm bg-white rounded-xl flex flex-col justify-between transition-all hover:shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-neutral-900">
                #{task.ticketId?.ticketId || "N/A"}
              </span>
              <div className="flex items-center gap-1.5">
                {["Completed", "Canceled"].includes(task.status) && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                    task.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                  }`}>
                    {task.status === "Completed" ? "Closed" : "Canceled"}
                  </span>
                )}
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-neutral-800 text-sm truncate">{task.ticketId?.customerName || "Pelanggan"}</h4>
              <p className="text-[11px] font-semibold text-neutral-400 mt-0.5 uppercase tracking-wider">{task.ticketId?.category || "Keluhan"}</p>
            </div>

            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
              <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider block">Instruksi NOC:</label>
              <p className="text-xs font-medium text-neutral-500 mt-0.5 line-clamp-2 leading-relaxed">
                {task.note || "Tidak ada catatan instruksi khusus."}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-4">
            <div className="text-[10px] font-medium text-neutral-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{moment(task.createdAt).format("DD MMM, HH:mm")}</span>
            </div>
            <div className="shrink-0 flex justify-end">{renderActions(task)}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// SUB KOMPONEN MODAL DETAIL LENGKAP PENANGANAN (LAZY-FETCH DATA)
function HistoryDetailModal({ assignmentId, ticketIdString }: { assignmentId: string; ticketIdString: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // Hook ini hanya akan memicu pengambilan data mendalam ke backend saat Modal dibuka (isOpen === true)
  const { data: res, isLoading, isError } = useGetAssignmentDetail(isOpen ? assignmentId : "");
  const task = res?.data;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 font-bold text-xs border-neutral-300 text-neutral-700 px-3 flex items-center gap-1"
        >
          <FileText className="h-3.5 w-3.5" /> Detail
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg bg-white border border-neutral-200 rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#36a7e3]" /> Berkas Arsip #{ticketIdString || "N/A"}
          </DialogTitle>
          <DialogDescription className="text-[11px] font-medium text-neutral-400">
            Detail rekam jejak surat tugas lapangan dan berkas laporan kerja penutupan teknisi.
          </DialogDescription>
        </DialogHeader>

        {/* STATE LOADING */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 text-[#36a7e3] animate-spin" />
            <p className="text-[11px] font-semibold text-neutral-400">Mengambil arsip mendalam...</p>
          </div>
        )}

        {/* STATE ERROR FETCHING */}
        {isError && (
          <div className="py-8 text-center text-xs font-semibold text-red-600 space-y-2">
            <ShieldAlert className="h-8 w-8 text-red-500 mx-auto" />
            <p>Gagal memuat rekam jejak data dari server pusat.</p>
          </div>
        )}

        {/* STATE RENDER DATA LENGKAP */}
        {!isLoading && !isError && task && (
          <div className="space-y-4 mt-2 text-xs font-medium text-neutral-700">
            
            {/* AREA DATA PELANGGAN */}
            <div className="grid grid-cols-2 gap-4 bg-neutral-50/60 p-3 rounded-lg border border-neutral-100">
              <div>
                <span className="text-neutral-400 block font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                  <User className="h-3 w-3" /> Nama Pelanggan
                </span>
                <span className="text-neutral-800 font-bold block mt-0.5 truncate">{task.ticketId?.customerName || "N/A"}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Tanggal Tugas
                </span>
                <span className="text-neutral-800 font-bold block mt-0.5">
                  {moment(task.createdAt).format("DD MMM YYYY, HH:mm")}
                </span>
              </div>
            </div>

            {/* AREA ALAMAT INSTALASI */}
            <div>
              <span className="text-neutral-400 block font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" /> Lokasi Rumah Pelanggan
              </span>
              <p className="text-neutral-600 bg-neutral-50 p-2.5 rounded border leading-relaxed">
                {task.ticketId?.address || "Detail koordinat tersimpan di sistem helpdesk utama."}
              </p>
            </div>

            {/* DETAIL KENDALA AWAL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-neutral-400 block font-bold text-[9px] uppercase tracking-wider">Kategori Gangguan</span>
                <span className="text-neutral-800 font-bold block mt-0.5 uppercase">{task.ticketId?.category || "N/A"}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-bold text-[9px] uppercase tracking-wider">Judul Masalah</span>
                <span className="text-neutral-800 font-bold block mt-0.5">{task.ticketId?.issueTitle || "N/A"}</span>
              </div>
            </div>

            {/* LAPORAN AKHIR KERJA TEKNISI (CLOSING REPORT) */}
            <div className="border-t border-neutral-100 pt-3 space-y-3">
              <h4 className="font-extrabold text-neutral-900 text-[10px] uppercase tracking-wider flex items-center gap-1.5 text-neutral-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Hasil Akhir Penanganan Lapangan
              </h4>

              <div className="space-y-2">
                <div>
                  <span className="text-neutral-400 block font-bold text-[9px] uppercase tracking-wider">Tindakan Solusi / Material</span>
                  <span className="text-emerald-700 font-extrabold block bg-emerald-50/60 p-2 rounded border border-emerald-100 mt-1">
                    {task.workReport?.solution || (task.status === "Canceled" ? "Tugas di-Canceled oleh pihak NOC." : "Arsip tidak ditemukan.")}
                  </span>
                </div>

                {task.workReport?.finalNote && (
                  <div>
                    <span className="text-neutral-400 block font-bold text-[9px] uppercase tracking-wider">Catatan Penutupan Berkas</span>
                    <p className="text-neutral-600 bg-neutral-50 p-2.5 rounded border border-neutral-200/60 mt-1 leading-relaxed">
                      {task.workReport.finalNote}
                    </p>
                  </div>
                )}

                {task.workReport?.evidenceUrl && (
                  <div className="pt-1">
                    <span className="text-neutral-400 block font-bold text-[9px] uppercase tracking-wider">Dokumentasi Bukti Foto / OPM</span>
                    <a 
                      href={task.workReport.evidenceUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1 text-[#36a7e3] font-bold hover:underline mt-1"
                    >
                      Lihat Berkas Foto Bukti Lapangan <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER WAKTU RESOLVED */}
            {task.workReport?.submittedAt && (
              <div className="border-t border-neutral-100 pt-2.5 text-[10px] font-bold text-neutral-400 text-right">
                Durasi Kerja Ditutup Pada: {moment(task.workReport.submittedAt).format("DD MMMM YYYY, HH:mm WIB")}
              </div>
            )}

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// SUB KOMPONEN TOMBOL TAB
function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
        active
          ? "border-neutral-900 text-neutral-900 font-extrabold"
          : "border-transparent text-neutral-400 hover:text-neutral-600"
      }`}
    >
      {label}
    </button>
  );
}