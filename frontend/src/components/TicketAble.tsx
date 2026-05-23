// src/components/TicketTable.tsx
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Trash2, Edit2, Calendar } from "lucide-react";
import { Ticket } from "@/api/ticket";
import { useDeleteTicketMutation } from "@/hooks/api/useTicketMutations";
import { toast } from "sonner";
import { format } from "date-fns"; // 💡 Import untuk pemformatan tanggal

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  const { mutate: deleteTicket, isPending: isDeleting } = useDeleteTicketMutation();

  const handleDelete = (id: string, ticketId: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus tiket ${ticketId}?`)) {
      deleteTicket(id, {
        onSuccess: () => toast.success(`Tiket ${ticketId} berhasil dihapus`),
        onError: (err: any) => toast.error(err.response?.data?.message || "Gagal menghapus tiket")
      });
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-neutral-500 font-medium">
        Belum ada laporan kendala masuk.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-400 font-semibold text-left">
          <tr>
            <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">ID Tiket</th>
            <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">Tanggal Laporan</th> {/* 💡 Judul Kolom Baru */}
            <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">Customer</th>
            <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">Kendala (Issue)</th>
            <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">Status Tracker</th>
            <th className="px-6 py-3 text-right font-bold uppercase text-[10px] tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 bg-white">
          {tickets.map((t) => {
            // 💡 Proteksi formatting tanggal jika data createdAt null/undefined
            const formattedDate = t.createdAt 
              ? format(new Date(t.createdAt), "dd MMM yyyy HH:mm") 
              : "—";

            return (
              <tr key={t._id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-3.5 font-mono font-bold text-neutral-900">{t.ticketId}</td>
                
                {/* 💡 RENDER FIELD TANGGAL BERKAS */}
                <td className="px-6 py-3.5 font-medium text-neutral-500 text-xs whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    {formattedDate}
                  </div>
                </td>

                <td className="px-6 py-3.5 font-medium text-neutral-700">{t.customerName}</td>
                <td className="px-6 py-3.5 text-neutral-500 font-medium">{t.issueTitle}</td>
                <td className="px-6 py-3.5"><StatusBadge status={t.status} /></td>
                <td className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    
                    {/* TOMBOL DETAIL */}
                    <Link
                      to="/helpdesk/monitoring/$id"
                      params={{ id: t._id }}      
                      className="text-xs font-bold transition-colors hover:underline text-[#36a7e3] mr-1"
                    >
                      Detail
                    </Link>

                    {/* TOMBOL EDIT */}
                    {["OPEN", "CONFIRMED"].includes(t.status) && (
                      <Link
                        to="/helpdesk/edit/$id"
                        params={{ id: t._id }}
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Edit Detail Tiket"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Link>
                    )}

                    {/* TOMBOL DELETE */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      disabled={isDeleting}
                      onClick={() => handleDelete(t._id, t.ticketId)}
                      title="Hapus Tiket"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}