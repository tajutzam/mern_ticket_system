import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useTicketDetail, useUpdateTicketMutation } from "@/hooks/api/useTicketMutations";
import { toast } from "sonner";
import { Loader2, AlertCircle, ArrowLeft, Save } from "lucide-react";

export const Route = createFileRoute("/helpdesk/edit/$id")({
  component: EditTicketComponent,
  head: () => ({ meta: [{ title: "Edit Ticket — SIPATEN" }] }),
});

const categories = [
  "Internet Down",
  "Slow Connection",
  "Wi-Fi Issue",
  "Hardware Problem",
  "Configuration",
  "Other",
];

function EditTicketComponent() {
  const { id } = useParams({ from: "/helpdesk/edit/$id" });
  const router = useRouter();

  const { data: response, isLoading, isError, error } = useTicketDetail(id);
  const { mutate: updateTicket, isPending: isUpdating } = useUpdateTicketMutation();

  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    issueTitle: "",
    description: "",
    category: "Internet Down",
  });

  useEffect(() => {
    if (response?.data) {
      const ticket = response.data;
      setForm({
        customerName: ticket.customerName || "",
        phoneNumber: ticket.phoneNumber || "",
        issueTitle: ticket.issueTitle || "",
        description: ticket.description || "",
        category: ticket.category || "Internet Down",
      });
    }
  }, [response]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.customerName || !form.issueTitle || !form.phoneNumber) {
      toast.error("Nama customer, nomor telepon, dan judul masalah wajib diisi");
      return;
    }

    updateTicket(
      { id, data: form },
      {
        onSuccess: () => {
          toast.success("Perubahan data tiket berhasil disimpan.");
          // Kembali ke halaman dashboard setelah sukses
          router.navigate({ to: "/helpdesk" });
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || "Gagal memperbarui tiket.";
          toast.error(errMsg);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <AppLayout role="helpdesk">
        <PageHeader title="Memuat Form Edit..." />
        <div className="p-8 flex items-center justify-center py-24">
          <Loader2 className="h-7 w-7 text-[#36a7e3] animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !response?.data) {
    return (
      <AppLayout role="helpdesk">
        <PageHeader title="Gagal Memuat Data" />
        <div className="p-8 max-w-md mx-auto text-center space-y-4 pt-16">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 grid place-items-center mx-auto border border-red-100">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-sm text-neutral-500 font-medium">
            {error?.message || "Data tiket gagal ditarik atau status sudah tidak bisa diedit."}
          </p>
          <Button variant="outline" className="w-full" onClick={() => router.navigate({ to: "/helpdesk" })}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  const currentTicket = response.data;

  return (
    <AppLayout role="helpdesk">
      <PageHeader
        title={`Edit Ticket ${currentTicket.ticketId}`}
        subtitle="Perbarui rincian laporan kendala sebelum diproses lebih lanjut."
      />
      <div className="p-8 max-w-3xl">
        <Card className="p-6 border-neutral-200/80 shadow-md rounded-xl">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cn">Customer Name</Label>
                <Input
                  id="cn"
                  placeholder="PT ABC"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  disabled={isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ph">Phone Number</Label>
                <Input
                  id="ph"
                  placeholder="6281234567890"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ti">Issue Title</Label>
              <Input
                id="ti"
                placeholder="Internet Down"
                value={form.issueTitle}
                onChange={(e) => setForm({ ...form, issueTitle: e.target.value })}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="de">Description</Label>
              <Textarea
                id="de"
                rows={4}
                placeholder="Tulis detail kendala teknis di sini..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={isUpdating}
              />
            </div>

            {/* Tombol aksi form */}
            <div className="flex gap-2 justify-end pt-2 border-t border-neutral-100 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.navigate({ to: "/helpdesk" })}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} className="bg-neutral-900 text-white hover:bg-neutral-800">
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}