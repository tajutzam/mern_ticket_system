import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { useSipaten } from "@/lib/sipaten-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  TicketSummary,
  ProgressTimeline,
  WhatsAppLog,
} from "@/components/TicketPanels";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, MapPin, Plus, Send } from "lucide-react";

export const Route = createFileRoute("/technical/assignments/$id")({
  component: TechDetail,
  head: () => ({ meta: [{ title: "Assignment Detail — SIPATEN" }] }),
});

function TechDetail() {
  const { id } = useParams({ from: "/technical/assignments/$id" });
  const router = useRouter();
  const ticket = useSipaten((s) => s.tickets.find((t) => t.id === `#${id}`));
  const { acceptAssignment, addProgress, submitReport } = useSipaten();

  const [note, setNote] = useState("");
  const [solution, setSolution] = useState("");
  const [evidence, setEvidence] = useState("");

  if (!ticket) {
    return (
      <AppLayout role="technical">
        <PageHeader title="Assignment not found" />
        <div className="p-8">
          <Button onClick={() => router.navigate({ to: "/technical" })}>
            Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  const canAccept = ticket.status === "ASSIGNED";
  const canWork = ["IN_PROGRESS", "ON_SITE"].includes(ticket.status);

  return (
    <AppLayout role="technical">
      <PageHeader
        title={`Assignment ${ticket.id}`}
        subtitle={ticket.assignmentNote || "Field assignment from NOC."}
        actions={
          canAccept && (
            <Button
              onClick={() => {
                acceptAssignment(ticket.id);
                toast.success("Assignment accepted", {
                  description: "Status: IN PROGRESS",
                });
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Accept
            </Button>
          )
        }
      />
      <div className="p-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TicketSummary ticket={ticket} />

          {canWork && (
            <>
              <Card className="p-6">
                <h3 className="font-semibold mb-3">Update Progress</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Contoh: Arrived onsite, checking router…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!note.trim()) return;
                        addProgress(ticket.id, note);
                        setNote("");
                        toast.success("Progress logged");
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Log
                    </Button>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      addProgress(ticket.id, "Technician arrived onsite", true);
                      toast.success("Status → ON SITE");
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" /> Mark On Site
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">Submit Work Report</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Solution</Label>
                    <Textarea
                      rows={3}
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      placeholder="Replaced UTP cable from patch panel to AP, link UP."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Evidence (link / filename)</Label>
                    <Input
                      placeholder="evidence-001.jpg"
                      value={evidence}
                      onChange={(e) => setEvidence(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        if (!solution.trim()) {
                          toast.error("Isi solution dulu");
                          return;
                        }
                        submitReport(ticket.id, solution, evidence);
                        toast.success("Report submitted", {
                          description: "Ticket closed & WhatsApp terkirim.",
                        });
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" /> Submit Report
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}

          <ProgressTimeline ticket={ticket} />
        </div>
        <div className="space-y-6">
          <WhatsAppLog ticket={ticket} />
        </div>
      </div>
    </AppLayout>
  );
}
