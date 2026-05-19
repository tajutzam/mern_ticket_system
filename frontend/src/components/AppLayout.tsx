import { Link, useRouter } from "@tanstack/react-router";
import { type Role, useSipaten } from "@/lib/sipaten-store";
import { Button } from "@/components/ui/button";
// Import hook useCurrentUser yang sudah kita buat sebelumnya
import { useCurrentUser } from "@/hooks/api/useAuthMutations";
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
  Activity,
  Users,
  ClipboardList,
  LogOut,
  Radio,
} from "lucide-react";
import type { ReactNode } from "react";

const navByRole: Record<
  Role,
  { to: string; label: string; icon: ReactNode }[]
> = {
  helpdesk: [
    { to: "/helpdesk", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { to: "/helpdesk/create", label: "Create Ticket", icon: <PlusCircle className="h-4 w-4" /> },
    { to: "/helpdesk/monitoring", label: "Monitoring Ticket", icon: <Ticket className="h-4 w-4" /> },
  ],
  noc: [
    { to: "/noc", label: "Monitoring & Analysis", icon: <Activity className="h-4 w-4" /> },
    { to: "/noc/technicians", label: "Technical Availability", icon: <Users className="h-4 w-4" /> },
  ],
  technical: [
    { to: "/technical", label: "Assignment List", icon: <ClipboardList className="h-4 w-4" /> },
  ],
};

const roleLabel: Record<Role, string> = {
  helpdesk: "Helpdesk",
  noc: "NOC",
  technical: "Technical",
};

export function AppLayout({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { setRole } = useSipaten();
  const router = useRouter();
  const pathname = router.state.location.pathname;

  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
        Memuat sesi pengguna...
      </div>
    );
  }


  if (isError || !user) {
    setRole(null);
    router.navigate({ to: "/" });
    return null;
  }

  // Ambil menu navigasi berdasarkan role yang aktif
  const nav = navByRole[role];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold tracking-tight">SIPATEN</div>
              <div className="text-xs text-muted-foreground">
                Ticketing System
              </div>
            </div>
          </div>
        </div>

        {/* === 4. TAMPILKAN NAMA USER DARI BACKEND === */}
        <div className="px-5 py-3 border-b border-sidebar-border/50 bg-sidebar-accent/20">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Logged In As
          </div>
          {/* Menyesuaikan property response backend Anda (misal: user.data.name atau user.name) */}
          <div className="text-sm font-bold truncate text-primary">{user?.data?.name || user?.name}</div>
          <div className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">
            Role: <span className="font-semibold text-foreground">{roleLabel[role]}</span>
          </div>
        </div>

        <nav className="flex-1 px-3 mt-3 space-y-1">
          {nav.map((n) => {
            const active =
              n.to === `/${role}`
                ? pathname === n.to
                : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
              >
                {n.icon}
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            // Mengikuti saved preferences untuk tombol abu-abu
            className="w-full justify-start text-muted-foreground hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
            onClick={() => {
              // Hapus token saat logout agar interceptor tidak mengirim token mati
              localStorage.removeItem('token');
              setRole(null);
              router.navigate({ to: "/" });
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Switch role / Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-border bg-card px-8 py-5 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions}
    </div>
  );
}