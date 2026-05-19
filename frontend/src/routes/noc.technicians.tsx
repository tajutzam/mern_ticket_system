import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { useSipaten } from "@/lib/sipaten-store";
import { Switch } from "@/components/ui/switch";
import { UserCheck, UserX } from "lucide-react";

export const Route = createFileRoute("/noc/technicians")({
  component: TechAvailability,
  head: () => ({ meta: [{ title: "Technical Availability — SIPATEN" }] }),
});

function TechAvailability() {
  const { technicians, setTechnicianBusy } = useSipaten();
  return (
    <AppLayout role="noc">
      <PageHeader
        title="Technical Availability"
        subtitle="Lihat dan kelola status ketersediaan teknisi."
      />
      <div className="p-8 grid md:grid-cols-2 gap-4 max-w-4xl">
        {technicians.map((t) => (
          <Card key={t.id} className="p-5 flex items-center gap-4">
            <div
              className={`h-11 w-11 rounded-lg grid place-items-center ${
                t.available ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              {t.available ? (
                <UserCheck className="h-5 w-5" />
              ) : (
                <UserX className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{t.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t.available ? "Available" : "Busy"}
              </div>
            </div>
            <Switch
              checked={t.available}
              onCheckedChange={(v) => setTechnicianBusy(t.id, !v)}
            />
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
