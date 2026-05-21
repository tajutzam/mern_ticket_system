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
  Radio,
  User,
  Shield,
  Mail,
  Loader2,
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
  noc: "NOC Engineer",
  technical: "Technician",
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
        console.log("Sesi tidak valid, mengalihkan ke gerbang login...");
        setRole(null);
        router.navigate({ to: "/login" });
      }
    }
  }, [user, isLoading, isError, router, setRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center text-sm font-medium text-neutral-500 gap-3">
        <Loader2 className="h-6 w-6 text-[#36a7e3] animate-spin" />
        <span>Memverifikasi enkripsi sesi petugas...</span>
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  const nav = navByRole[role];

  const avatarInitial = userData?.name ? userData.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900 flex">

      <aside className="w-66 border-r border-neutral-200 bg-white text-neutral-900 flex flex-col shrink-0 shadow-sm">

        <div className="px-5 py-5 border-b border-neutral-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-neutral-900 text-white grid place-items-center font-bold shadow-sm">
              <Radio className="h-5 w-5 text-neutral-100" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight text-neutral-900 text-sm leading-none">SIPATEN</div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                Ticketing Workstation
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 mx-3 my-3 bg-neutral-50 border border-neutral-200/60 rounded-xl flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#36a7e3] text-white font-extrabold text-sm flex items-center justify-center shadow-inner">
              {avatarInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-neutral-400 leading-none">Petugas Aktif</div>
              <div className="text-sm font-bold text-neutral-900 truncate mt-1" title={userData?.name}>
                {userData?.name || "Nama Petugas"}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-neutral-200/60 text-xs text-neutral-600 font-medium">
            <div className="flex items-center gap-2 truncate" title={userData?.email}>
              <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{userData?.email || "email@perusahaan.com"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span className="font-semibold text-neutral-800">{roleLabel[role]}</span>
            </div>

            {role === "technical" && (
              <div className="flex items-center gap-2 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-700">
                  Status: {userData?.availabilityStatus || "Available"}
                </span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {nav?.map((n) => {
            const active =
              n.to === `/${role}`
                ? pathname === n.to
                : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${active
                    ? "bg-neutral-900 text-white shadow-md"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
              >
                <span className={active ? "text-white" : "text-neutral-400"}>
                  {n.icon}
                </span>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-neutral-100 bg-neutral-50/40">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start font-bold text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
            onClick={() => {
              localStorage.removeItem("token");
              setRole(null);
              router.navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4 mr-2 text-neutral-400" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {children}
      </main>
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
    <div className="border-b border-neutral-200 bg-white px-8 py-5 flex items-center justify-between shadow-sm sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-neutral-950">{title}</h1>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-0.5 font-medium">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}