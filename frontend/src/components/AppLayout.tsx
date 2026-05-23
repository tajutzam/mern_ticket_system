import { Link, useRouter } from "@tanstack/react-router";
import { type Role, useSipaten } from "@/lib/sipaten-store";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/api/useAuthMutations";
import { useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
  Activity,
  Users,
  ClipboardList,
  LogOut,
  Shield,
  Mail,
  Loader2,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";

const navByRole: Record<
  Role,
  { to: string; label: string; icon: ReactNode }[]
> = {
  helpdesk: [
    { to: "/helpdesk", label: "Dashboard Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { to: "/helpdesk/create", label: "Create Ticket", icon: <PlusCircle className="h-4 w-4" /> },
    { to: "/helpdesk/monitoring", label: "Monitoring System", icon: <Ticket className="h-4 w-4" /> },
    { to: "/helpdesk/users", label: "User Management", icon: <Users className="h-4 w-4" /> },
    { to: "/helpdesk/profile", label: "Setting Profile", icon: <Settings className="h-4 w-4" /> },

  ],
  noc: [
    { to: "/noc", label: "Metrics & Analysis", icon: <Activity className="h-4 w-4" /> },
    { to: "/noc/technicians", label: "Technical Dispatch", icon: <Users className="h-4 w-4" /> },
    { to: "/noc/profile", label: "Setting Profile", icon: <Settings className="h-4 w-4" /> },
  ],
  technical: [
    { to: "/technical", label: "Work Assignment", icon: <ClipboardList className="h-4 w-4" /> },
    { to: "/technical/profile", label: "Setting Profile", icon: <Settings className="h-4 w-4" /> },
  ],
};

const roleLabel: Record<Role, string> = {
  helpdesk: "Helpdesk Operation",
  noc: "NOC Infrastructure",
  technical: "Field Technician",
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

  const userData = user?.user || user;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!isLoading) {
      if (isError || !user || !token) {
        setRole(null);
        router.navigate({ to: "/login" });
      }
    }
  }, [user, isLoading, isError, router, setRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 text-[#36a7e3] animate-spin" />
        <span className="text-xs font-semibold text-neutral-400 tracking-wide uppercase">Securing Session...</span>
      </div>
    );
  }

  if (isError || !user) return null;

  const nav = navByRole[role];
  const avatarInitial = userData?.name ? userData.name.trim().charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 flex font-sans antialiased">

      {/* ENTERPRISE SIDEBAR CONTAINER */}
      <aside className="w-64 border-r border-neutral-200/60 bg-white flex flex-col shrink-0">

        {/* BRAND IDENTITY WITH LOGO.PNG */}
        <div className="h-16 px-6 border-b border-neutral-200/60 flex items-center gap-2.5 bg-white">
          <div className="h-8 w-8 overflow-hidden flex items-center justify-center rounded-lg select-none">
            <img
              src="/logo.png"
              alt="Logo SIPATEN"
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <div className="font-black text-sm tracking-tight text-neutral-900 leading-none">SIPATEN</div>
            <div className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase mt-1">Workstation v2.0</div>
          </div>
        </div>

        {/* ACCOUNT PROFILE COMPONENT WITH THEME ACCENT */}
        <div className="p-4 mx-4 my-4 bg-neutral-50/70 border border-neutral-200/50 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            {/* Avatar diselaraskan memakai warna tema utama #36a7e3 */}
            <div className="h-9 w-9 rounded-lg bg-[#36a7e3] text-white font-black text-xs flex items-center justify-center shadow-sm select-none">
              {avatarInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider leading-none">Petugas Aktif</div>
              <div className="text-sm font-black text-neutral-800 truncate mt-1" title={userData?.name}>
                {userData?.name || "Operator"}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-neutral-200/40 text-[11px] font-medium text-neutral-500">
            <div className="flex items-center gap-2 truncate" title={userData?.email}>
              <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{userData?.email || "internal@telecom.id"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span className="font-bold text-neutral-700">{roleLabel[role]}</span>
            </div>

            {role === "technical" && (
              <div className="flex items-center gap-2 pt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                  Engine: {userData?.availabilityStatus || "Available"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION SEGMENT */}
        <nav className="flex-1 px-4 space-y-1">
          {nav?.map((n) => {
            const active = n.to === `/${role}` ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold tracking-wide uppercase transition-all duration-200 ${active
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
              >
                {/* Highlight warna ikon aktif disesuaikan menggunakan aksen warna brand #36a7e3 */}
                <span className={`transition-colors ${active ? "text-white" : "text-neutral-400 group-hover:text-neutral-600"}`}>
                  {n.icon}
                </span>
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT PANEL */}
        <div className="p-4 border-t border-neutral-100 bg-white">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start font-bold text-xs uppercase text-neutral-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-150 group"
            onClick={() => {
              localStorage.removeItem("token");
              setRole(null);
              router.navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4 mr-2 text-neutral-400 group-hover:text-red-500 transition-colors" />
            Sign Out Session
          </Button>
        </div>
      </aside>

      {/* WORKSPACE MAIN BODY */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

{/* CLEAN SAAS FLAT BAR HEADER */ }
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
    <div className="h-16 border-b border-neutral-200/60 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="min-w-0 flex-1">
        <h1 className="text-sm font-black tracking-tight text-neutral-900 uppercase">{title}</h1>
        {subtitle && (
          <p className="text-[11px] font-medium text-neutral-400 truncate mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}