import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GeneralProfile } from "@/components/GeneralProfile";

export const Route = createFileRoute("/helpdesk/profile")({
  component: () => (
    <AppLayout role="helpdesk">
      <GeneralProfile roleLabel="Helpdesk Operation Workstation" />
    </AppLayout>
  ),
});