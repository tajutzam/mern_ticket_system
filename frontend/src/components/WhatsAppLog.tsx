import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/axiosInstance";
import type { Ticket } from "@/api/ticket";

interface WALogItem {
  _id: string;
  ticketId: string;
  recipientName: string;
  recipientRole: "Customer" | "Technical" | "NOC" | "Helpdesk";
  phoneNumber: string;
  messageType: "TICKET_CONFIRMED" | "ASSIGNMENT_NOTIF" | "TICKET_RESOLVED" | "TICKET_CLOSED";
  messageContent: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED";
  errorMessage: string | null;
  sentAt: string;
  createdAt: string;
}

export function WhatsAppLog({ ticket }: { ticket: Ticket }) {
  const { data: waResponse, isLoading } = useQuery({
    queryKey: ["waLogs", ticket._id],
    queryFn: async () => {
      const res = await api.get(`/wa-logs/ticket/${ticket._id}`);
      return res.data; // Mengambil objek response { status: "success", data: [...] }
    },
    enabled: !!ticket._id,
  });

  // Ekstraksi data array dari properti "data" pembungkus Express Controller
  const logs: WALogItem[] = waResponse?.data || [];

  if (isLoading) {
    return (
      <Card className="p-6 border-neutral-200/80 shadow-sm bg-white flex flex-col items-center justify-center py-12 gap-2">
        <span className="h-4 w-4 rounded-full border-2 border-neutral-300 border-t-[#36a7e3] animate-spin" />
        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Memuat riwayat antrean notifikasi...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-neutral-200/80 shadow-sm bg-white">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-4 w-4 text-emerald-600" />
        <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wider">Automated WhatsApp Logs</h3>
      </div>
      
      {logs.length === 0 ? (
        <div className="p-6 border border-dashed border-neutral-200 rounded-xl text-center text-xs font-medium text-neutral-400">
          Belum ada rekaman notifikasi WhatsApp terkirim untuk tiket ini.
        </div>
      ) : (
        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
          {logs.map((w, i) => {
            // Proteksi konversi tanggal agar tidak memicu runtime error jika value string corrupt / kosong
            const rawDate = w.sentAt || w.createdAt;
            const formattedTime = rawDate ? format(new Date(rawDate), "dd MMM HH:mm") : "—";

            // Kondisi pewarnaan badge dinamis berdasarkan kembalikan Mongoose enum status
            const isSuccess = w.status === "SENT" || w.status === "DELIVERED";
            const isPending = w.status === "PENDING";

            return (
              <div
                key={w._id || i}
                className="rounded-xl bg-neutral-50/70 border border-neutral-200/60 p-3.5 space-y-2 group"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="text-[11px] text-neutral-400 font-medium">
                    Ke: <span className="font-bold text-neutral-800">{w.recipientName}</span> 
                    <span className="text-neutral-500 font-mono ml-1">({w.phoneNumber})</span>
                    <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-neutral-200/60 text-neutral-600 uppercase tracking-wide">
                      {w.recipientRole}
                    </span>
                  </div>
                  
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide transition-colors ${
                    isSuccess 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : isPending
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {w.status}
                  </span>
                </div>
                
                {/* Isi Teks Pesan Enkapsulasi */}
                <pre className="text-xs whitespace-pre-wrap font-sans text-neutral-600 leading-relaxed bg-white border border-neutral-100 rounded-lg p-2.5 font-medium shadow-inner">
                  {w.messageContent}
                </pre>

                {/* Sub-tampilan info tambahan penanda jika ada kegagalan pengiriman Fonnte */}
                {w.status === "FAILED" && w.errorMessage && (
                  <div className="text-[10px] font-bold text-red-600 bg-red-50/40 border border-red-100 px-2 py-1 rounded-md leading-none">
                    Reason: {w.errorMessage}
                  </div>
                )}
                
                <div className="text-[10px] text-neutral-400 font-medium text-right font-mono">
                  {formattedTime}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}