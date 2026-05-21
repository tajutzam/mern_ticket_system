import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import {
  TicketSummary,
  ProgressTimeline,
  WhatsAppLog,
} from "@/components/TicketPanels";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCheck, Send, UserCheck, Loader2, AlertCircle, ArrowLeft, Radio } from "lucide-react";
import { 
  useTicketDetail, 
  useGetTechnicians, 
  useResolveTicketRemoteMutation, 
  useAssignTicketMutation 
} from "@/hooks/api/useTicketMutations";

export const Route = createFileRoute("/noc/tickets/$id")({
  component: NocDetail,
  head: () => ({ meta: [{ title: "NOC Ticket Analysis — SIPATEN" }] }),
});

function NocDetail() {
  const { id } = useParams({ from: "/noc/tickets/$id" });
  const router = useRouter();

  const [mode, setMode] = useState<"choose" | "remote" | "assign">("choose");
  const [remoteNote, setRemoteNote] = useState("");
  const [techId, setTechId] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");

  const { data: ticketRes, isLoading: isTicketLoading, isError: isTicketError } = useTicketDetail(id);
  const { data: techRes, isLoading: isTechLoading } = useGetTechnicians();

  const { mutate: resolveRemote, isPending: isResolving } = useResolveTicketRemoteMutation();
  const { mutate: assignTicket, isPending: isAssigning } = useAssignTicketMutation();

  const ticket = ticketRes?.data;
  const techniciansList = techRes?.data || [];

  const availableTechs = techniciansList.filter((t: any) => t.availabilityStatus === "Available");
  const canTakeAction = ticket?.status === "CONFIRMED";

  if (isTicketLoading || isTechLoading) {
    return (
      <AppLayout role="noc">
        <PageHeader title="Menganalisis Berkas..." />
        <div className="p-8 flex items-center justify-center py-24">
          <Loader2 className="h-7 w-7 text-[#36a7e3] animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (isTicketError || !ticket) {
    return (
      <AppLayout role="noc">
        <PageHeader title="Tiket Tidak Valid" />
        <div className="p-8 max-w-md mx-auto text-center space-y-4 pt-16">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 grid place-items-center mx-auto border border-red-100">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-sm text-neutral-500 font-medium">
            Gagal memuat detail analisis tiket. Data tidak ditemukan atau koneksi pangkalan data terputus.
          </p>
          <Button variant="outline" className="w-full" onClick={() => router.navigate({ to: "/noc" })}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Antrean
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="noc">
      <PageHeader
        title={`Analyze Ticket ${ticket.ticketId}`}
        subtitle="Analisis kendala teknis: Tentukan penyelesaian pusat atau penerbitan tugas lapangan."
      />
      
      <div className="p-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TicketSummary ticket={ticket} />

          {canTakeAction ? (
            <Card className="p-6 border-neutral-200/80 shadow-sm bg-white rounded-xl">
              <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Radio className="h-4 w-4 text-[#36a7e3]" /> Operational Decision Panel
              </h3>
              
              {mode === "choose" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode("remote")}
                    className="rounded-xl border border-neutral-200 p-5 text-left hover:border-[#36a7e3] hover:bg-neutral-50/50 transition-all shadow-sm group"
                  >
                    <CheckCheck className="h-6 w-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-neutral-900">Case A: Resolve Remote</div>
                    <div className="text-xs font-medium text-neutral-400 mt-1.5 leading-relaxed">
                      Masalah sistem atau konfigurasi software. Dapat diselesaikan langsung melalui pusat.
                    </div>
                  </button>

                  <button
                    onClick={() => setMode("assign")}
                    className="rounded-xl border border-neutral-200 p-5 text-left hover:border-neutral-900 hover:bg-neutral-50/50 transition-all shadow-sm group"
                  >
                    <UserCheck className="h-6 w-6 text-neutral-800 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-neutral-900">Case B: Assign to Field Technician</div>
                    <div className="text-xs font-medium text-neutral-400 mt-1.5 leading-relaxed">
                      Kerusakan fisik atau hardware. Memerlukan kunjungan petugas ke lokasi pelanggan.
                    </div>
                  </button>
                </div>
              )}

              {/* FORM VIEW CASE A: RESOLVE REMOTE */}
              {mode === "remote" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-neutral-700">Resolution Note (Solusi Remote)</Label>
                    <Textarea
                      rows={3}
                      value={remoteNote}
                      onChange={(e) => setRemoteNote(e.target.value)}
                      placeholder="Masukkan detail perbaikan remote. Contoh: Port OLT berhasil di-reset, redaman kembali normal."
                      disabled={isResolving}
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2 border-t border-neutral-100">
                    <Button variant="outline" onClick={() => setMode("choose")} disabled={isResolving}>
                      Kembali
                    </Button>
                    <Button
                      disabled={isResolving}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold"
                      onClick={() => {
                        if (!remoteNote.trim()) {
                          toast.error("Catatan solusi remote wajib diisi.");
                          return;
                        }
                        resolveRemote(
                          { id: ticket._id, note: remoteNote },
                          {
                            onSuccess: () => {
                              toast.success("Tiket diselesaikan secara remote", {
                                description: "Status diperbarui menjadi CLOSED dan log tercatat.",
                              });
                              router.navigate({ to: "/noc" });
                            },
                            onError: (err: any) => {
                              toast.error(err.response?.data?.message || "Gagal memproses solusi remote.");
                            }
                          }
                        );
                      }}
                    >
                      {isResolving ? "Memproses..." : "Resolve Ticket"}
                    </Button>
                  </div>
                </div>
              )}

              {/* FORM VIEW CASE B: DELEGASI TEKNISI LAPANGAN */}
              {mode === "assign" && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-neutral-700">Teknisi Lapangan Standby</Label>
                      <Select value={techId} onValueChange={setTechId} disabled={isAssigning}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih petugas lapangan" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTechs.length === 0 && (
                            <div className="px-3 py-2 text-xs font-semibold text-neutral-400 text-center">
                              Seluruh teknisi lapangan sedang bertugas
                            </div>
                          )}
                          {availableTechs.map((t: any) => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="font-bold text-neutral-700">Prioritas Penugasan</Label>
                      <Select
                        value={priority}
                        onValueChange={(v) => setPriority(v as "Low" | "Medium" | "High")}
                        disabled={isAssigning}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low Priority</SelectItem>
                          <SelectItem value="Medium">Medium Priority</SelectItem>
                          <SelectItem value="High">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-neutral-700">Assignment Note (Instruksi Tugas)</Label>
                    <Textarea
                      rows={3}
                      value={assignNote}
                      onChange={(e) => setAssignNote(e.target.value)}
                      placeholder="Masukkan instruksi kerja lapangan. Contoh: Pengecekan dropcore putus, siapkan optical splicer."
                      disabled={isAssigning}
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-neutral-100">
                    <Button variant="outline" onClick={() => setMode("choose")} disabled={isAssigning}>
                      Kembali
                    </Button>
                    <Button
                      disabled={isAssigning}
                      className="bg-neutral-900 text-white hover:bg-neutral-800 font-bold"
                      onClick={() => {
                        if (!techId) {
                          toast.error("Pilih teknisi lapangan terlebih dahulu.");
                          return;
                        }
                        assignTicket(
                          {
                            id: ticket._id,
                            payload: { technicianId: techId, note: assignNote, priority }
                          },
                          {
                            onSuccess: () => {
                              toast.success("Surat penugasan berhasil diterbitkan", {
                                description: "Notifikasi kerja dikirim ke terminal teknisi.",
                              });
                              router.navigate({ to: "/noc" });
                            },
                            onError: (err: any) => {
                              toast.error(err.response?.data?.message || "Gagal menerbitkan penugasan.");
                            }
                          }
                        );
                      }}
                    >
                      {isAssigning ? "Mendelegasikan..." : "Assign Task"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-center text-xs font-semibold text-neutral-400">
              Panel Keputusan Dikunci: Tiket sudah berada dalam tahap penanganan teknis ({ticket.status}).
            </Card>
          )}

          <ProgressTimeline ticket={ticket} />
        </div>

        {/* SIDEBAR TIM LAPANGAN */}
        <div className="space-y-6">
          <Card className="p-6 border-neutral-200/80 shadow-sm bg-white rounded-xl">
            <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wider mb-4">
              Technicians Board Status
            </h3>
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
              {techniciansList.length === 0 ? (
                <p className="text-xs font-medium text-neutral-400 text-center py-4">Belum ada teknisi terdaftar.</p>
              ) : (
                techniciansList.map((t: any) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between text-sm p-2 rounded-lg bg-neutral-50/60 border border-neutral-100"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-bold text-neutral-800 truncate">{t.name}</div>
                      <div className="text-[10px] text-neutral-400 font-medium truncate mt-0.5">{t.email}</div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                        t.availabilityStatus === "Available"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {t.availabilityStatus || "Available"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
          
          <WhatsAppLog ticket={ticket} />
        </div>
      </div>
    </AppLayout>
  );
}