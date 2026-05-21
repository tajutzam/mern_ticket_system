import { createFileRoute, useRouter } from "@tanstack/react-router";
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
import { useState } from "react";
import { useCreateTicketMutation } from "@/hooks/api/useTicketMutations";
import { toast } from "sonner";

export const Route = createFileRoute("/helpdesk/create")({
  component: CreateTicket,
  head: () => ({ meta: [{ title: "Create Ticket — SIPATEN" }] }),
});

const categories = [
  "Internet Down",
  "Slow Connection",
  "Wi-Fi Issue",
  "Hardware Problem",
  "Configuration",
  "Other",
];

function CreateTicket() {
  const { mutate, isPending } = useCreateTicketMutation();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "", // Disesuaikan dengan skema database backend (phoneNumber)
    issueTitle: "",   // Disesuaikan dengan skema database backend (issueTitle)
    description: "",
    category: "Internet Down",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.customerName || !form.issueTitle || !form.phoneNumber) {
      toast.error("Nama customer, nomor telepon, dan judul masalah wajib diisi");
      return;
    }

    mutate(form, {
      onSuccess: (response) => {
        const newTicket = response.data;

        toast.success(`Ticket ${newTicket.ticketId} Berhasil Dibuat`, {
          description: "Status: OPEN — Melanjutkan ke halaman konfirmasi.",
        });

        router.navigate({
          to: "/helpdesk/monitoring/$id",
          params: { id: newTicket._id },
        });
      },
      onError: (error: any) => {
        console.log(error)
        const errorMessage = error.response?.data?.message || "Gagal membuat ticket baru.";
        toast.error(errorMessage);
      }
    });
  };

  return (
    <AppLayout role="helpdesk">
      <PageHeader
        title="Create Ticket"
        subtitle="Catat laporan customer untuk diproses oleh NOC."
      />
      <div className="p-8 max-w-3xl">
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cn">Customer Name</Label>
                <Input
                  id="cn"
                  placeholder="PT ABC"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ph">Phone Number</Label>
                <Input
                  id="ph"
                  placeholder="6281234567890"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  disabled={isPending}
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
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
                disabled={isPending}
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
                placeholder="No internet connection since 08:00"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                disabled={isPending}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.navigate({ to: "/helpdesk" })}
                disabled={isPending}
              >
                Cancel
              </Button>
              
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit Ticket"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}