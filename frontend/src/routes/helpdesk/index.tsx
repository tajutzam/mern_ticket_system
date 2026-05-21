import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/AppLayout";
// Menggunakan hook khusus dashboard stats dan query tiket terkini
import { useDashboardStats, useTickets } from "@/hooks/api/useTicketMutations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Inbox, CheckCircle2, ArrowRight, Loader2, AlertCircle, BarChart3, PieChart as PieIcon } from "lucide-react";
import { TicketTable } from "@/components/TicketAble";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/helpdesk/")({
  component: HelpdeskDashboard,
  head: () => ({ meta: [{ title: "Helpdesk Dashboard — SIPATEN" }] }),
});

function HelpdeskDashboard() {
  // 1. Ambil data kalkulasi dashboard terpusat dari endpoint khusus backend
  const { data: statsRes, isLoading: isStatsLoading, isError: isStatsError, error: statsError } = useDashboardStats();
  
  // 2. Tetap ambil data tiket umum murni untuk keperluan list tabel terkini (Recent Tickets)
  const { data: ticketsRes, isLoading: isTicketsLoading } = useTickets();

  const stats = statsRes?.data;
  const tickets = ticketsRes?.data || [];

  const isLoading = isStatsLoading || isTicketsLoading;

  if (isLoading) {
    return (
      <AppLayout role="helpdesk">
        <PageHeader title="Helpdesk Dashboard" subtitle="Menyiapkan workstation berkas..." />
        <div className="p-8 flex flex-col items-center justify-center py-32 gap-2">
          <Loader2 className="h-7 w-7 text-[#36a7e3] animate-spin" />
          <p className="text-xs font-medium text-neutral-500">Sinkronisasi metrik operasional harian...</p>
        </div>
      </AppLayout>
    );
  }

  if (isStatsError || !stats) {
    return (
      <AppLayout role="helpdesk">
        <PageHeader title="Helpdesk Dashboard" />
        <div className="p-8 max-w-xl mx-auto pt-16">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl text-sm font-medium">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>Gagal memuat parameter dashboard: {statsError?.message || "Interkoneksi API putus."}</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Siapkan data komposisi untuk Donut Chart dari summary data backend
  const statusData = [
    { name: "Open", value: stats.summary.open, color: "#36a7e3" },
    { name: "In Progress", value: stats.summary.inProgress, color: "#e8ae0c" },
    { name: "Closed / Resolved", value: stats.summary.closed, color: "#10b981" },
  ];

  return (
    <AppLayout role="helpdesk">
      <PageHeader
        title="Helpdesk Dashboard"
        subtitle="Kelola laporan customer dari awal sampai confirmation."
        actions={
          <Link to="/helpdesk/create">
            <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
              <PlusCircle className="h-4 w-4 mr-2" /> Create Ticket
            </Button>
          </Link>
        }
      />
      
      <div className="p-8 space-y-6">
        {/* TOP STAT BLOCK METRICS */}
        <div className="grid md:grid-cols-3 gap-4">
          <Stat label="Open" value={stats.summary.open} icon={<Inbox className="h-5 w-5" />} tone="info" />
          <Stat label="In Progress" value={stats.summary.inProgress} icon={<ArrowRight className="h-5 w-5" />} tone="warning" />
          <Stat label="Closed / Resolved" value={stats.summary.closed} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        </div>

        {/* GRAFIK ANALISIS ROW */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* MULTI-STACKED TIMEFRAME AREA CHART (Lebar 2/3) */}
          <Card className="lg:col-span-2 p-6 border border-neutral-200/80 shadow-md rounded-xl bg-white flex flex-col justify-between">
            <div className="mb-6">
              <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#36a7e3]" /> Ticket Timeframe Analysis
              </h3>
              <p className="text-xs text-neutral-400 font-medium mt-1">Grafik multi-status masuknya keluhan pelanggan dalam 7 hari terakhir.</p>
            </div>

            <div className="h-[260px] w-full text-xs font-medium">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#36a7e3" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#36a7e3" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e8ae0c" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#e8ae0c" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" stroke="#a3a3a3" tickLine={false} axisLine={false} />
                  <YAxis stroke="#a3a3a3" tickLine={false} axisLine={false} allowDecimals={false} />
                  
                  <Tooltip 
                    contentStyle={{ background: "#171717", borderRadius: "8px", border: "none", color: "#fff" }}
                    labelStyle={{ color: "#a3a3a3", fontWeight: "bold", marginBottom: "4px" }}
                  />
                  
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: "15px" }} />

                  <Area 
                    type="monotone" 
                    dataKey="Closed / Resolved" 
                    stackId="1"
                    stroke="#10b981" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorClosed)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="In Progress" 
                    stackId="1"
                    stroke="#e8ae0c" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorProgress)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Open" 
                    stackId="1"
                    stroke="#36a7e3" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorOpen)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* COMPOSITION STATUS DONUT CHART (Lebar 1/3) */}
          <Card className="p-6 border border-neutral-200/80 shadow-md rounded-xl bg-white flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-[#36a7e3]" /> Status Share
              </h3>
              <p className="text-xs text-neutral-400 font-medium mt-1">Proporsi perbandingan persentase total tiket di database.</p>
            </div>

            <div className="h-[220px] w-full text-xs font-semibold relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#171717", borderRadius: "8px", border: "none", color: "#fff" }}
                    itemStyle={{ fontWeight: "bold" }}
                  />
                  <Legend 
                    iconType="circle" 
                    iconSize={8}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute top-[41%] left-0 right-0 text-center pointer-events-none">
                <span className="text-xl font-extrabold text-neutral-900 block leading-none">
                  {stats.summary.total}
                </span>
                <span className="text-[10px] uppercase font-bold text-neutral-400 mt-1 block tracking-wider">
                  Total
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* RECENT TICKETS ROW TABLE */}
        <Card className="overflow-hidden border border-neutral-200/80 shadow-md rounded-xl bg-white">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-bold text-neutral-900 text-sm uppercase tracking-wider">Recent Tickets (8 Terkini)</h2>
            <Link to="/helpdesk/monitoring" className="text-xs font-bold text-[#36a7e3] hover:underline">
              Lihat semua
            </Link>
          </div>
          <TicketTable tickets={tickets.slice(0, 8)} />
        </Card>
      </div>
    </AppLayout>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: "info" | "warning" | "success" }) {
  const toneCls = {
    info: "bg-blue-50 text-[#36a7e3]",
    warning: "bg-amber-50 text-[#e8ae0c]",
    success: "bg-emerald-50 text-emerald-600",
  }[tone];

  return (
    <Card className="p-5 flex items-center gap-4 border-neutral-200/80 shadow-sm bg-white rounded-xl">
      <div className={`h-11 w-11 rounded-lg grid place-items-center font-bold ${toneCls}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-extrabold tracking-tight text-neutral-900 leading-none">{value}</div>
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-1.5">{label}</div>
      </div>
    </Card>
  );
}