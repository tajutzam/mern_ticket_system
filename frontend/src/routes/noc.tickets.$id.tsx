import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { useSipaten } from "@/lib/sipaten-store";
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
import { CheckCheck, Send, UserCheck } from "lucide-react";

export const Route = createFileRoute("/noc/tickets/$id")({
  component: NocDetail,
  head: () => ({ meta: [{ title: "NOC Ticket — SIPATEN" }] }),
});

function NocDetail() {
  const { id } = useParams({ from: "/noc/tickets/$id" });
  const router = useRouter();
  const ticket = useSipaten((s) => s.tickets.find((t) => t.id === `#${id}`));
  const technicians = useSipaten((s) => s.technicians);
  const { resolveRemote, assignTicket } = useSipaten();
  const [mode, setMode] = useState<"choose" | "remote" | "assign">("choose");
  const [remoteNote, setRemoteNote] = useState("");
  const [techId, setTechId] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");

  if (!ticket) {
    return (
      <AppLayout role="noc">
        <PageHeader title="Ticket not found" />
        <div className="p-8">
          <Button onClick={() => router.navigate({ to: "/noc" })}>Back</Button>
        </div>
      </AppLayout>
    );
  }

  const available = technicians.filter((t) => t.available);
  const canTakeAction = ticket.status === "CONFIRMED";

  return (
    <AppLayout role="noc">
      <PageHeader
        title={`Analyze ${ticket.id}`}
        subtitle="Pilih resolve remote atau assign ke teknisi onsite."
      />
      <div className="p-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TicketSummary ticket={ticket} />

          {canTakeAction && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Decision</h3>
              {mode === "choose" && (
                <div className="grid md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode("remote")}
                    className="rounded-lg border border-border p-4 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <CheckCheck className="h-5 w-5 text-success mb-2" />
                    <div className="font-semibold">Resolve Remote</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Bisa diselesaikan tanpa kunjungan teknisi.
                    </div>
                  </button>
                  <button
                    onClick={() => setMode("assign")}
                    className="rounded-lg border border-border p-4 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <UserCheck className="h-5 w-5 text-primary mb-2" />
                    <div className="font-semibold">Assign to Technical</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Butuh teknisi datang ke lokasi customer.
                    </div>
                  </button>
                </div>
              )}

              {mode === "remote" && (
                <div className="space-y-3">
                  <Label>Resolution note</Label>
                  <Textarea
                    rows={3}
                    value={remoteNote}
                    onChange={(e) => setRemoteNote(e.target.value)}
                    placeholder="Restart router via remote, koneksi normal."
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setMode("choose")}>
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (!remoteNote.trim()) {
                          toast.error("Tulis resolution note dulu");
                          return;
                        }
                        resolveRemote(ticket.id, remoteNote);
                        toast.success("Ticket resolved", {
                          description: "WhatsApp terkirim ke customer.",
                        });
                      }}
                    >
                      <CheckCheck className="h-4 w-4 mr-2" /> Resolve Ticket
                    </Button>
                  </div>
                </div>
              )}

              {mode === "assign" && (
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Technician (Available only)</Label>
                      <Select value={techId} onValueChange={setTechId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih teknisi" />
                        </SelectTrigger>
                        <SelectContent>
                          {available.length === 0 && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              Tidak ada teknisi available
                            </div>
                          )}
                          {available.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={priority}
                        onValueChange={(v) => setPriority(v as "Low" | "Medium" | "High")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Assignment note</Label>
                    <Textarea
                      rows={3}
                      value={assignNote}
                      onChange={(e) => setAssignNote(e.target.value)}
                      placeholder="Bawa cadangan kabel UTP & router spare."
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setMode("choose")}>
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (!techId) {
                          toast.error("Pilih teknisi dulu");
                          return;
                        }
                        assignTicket(ticket.id, techId, assignNote, priority);
                        toast.success("Assigned + WhatsApp sent", {
                          description: "Teknisi telah dinotifikasi.",
                        });
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" /> Assign + Send WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          <ProgressTimeline ticket={ticket} />
        </div>
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Available Technicians</h3>
            <div className="space-y-2">
              {technicians.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{t.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      t.available
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.available ? "Available" : "Busy"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <WhatsAppLog ticket={ticket} />
        </div>
      </div>
    </AppLayout>
  );
}
