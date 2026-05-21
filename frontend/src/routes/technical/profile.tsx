import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GeneralProfile } from "@/components/GeneralProfile";

export const Route = createFileRoute("/technical/profile")({
  component: () => (
    <AppLayout role="technical">
      <GeneralProfile roleLabel="Field Engineering Technician" />
    </AppLayout>
  ),
});