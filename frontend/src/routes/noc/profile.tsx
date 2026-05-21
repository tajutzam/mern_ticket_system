import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GeneralProfile } from "@/components/GeneralProfile";

export const Route = createFileRoute("/noc/profile")({
  component: () => (
    <AppLayout role="noc">
      <GeneralProfile roleLabel="NOC Infrastructure Authority" />
    </AppLayout>
  ),
});