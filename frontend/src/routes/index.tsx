import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Headphones, Activity, Wrench, ArrowRight,
  Search, ShieldCheck, Zap, Bot, Network, ServerCrash
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SIPATEN — Integrated Ticketing Workspace" },
      {
        name: "description",
        content: "Enterprise ticketing engine for high-speed network infrastructure management.",
      },
    ],
  }),
});

const roles = [
  {
    id: "helpdesk",
    title: "Helpdesk Station",
    desc: "Garda utama penerima eskalasi keluhan pelanggan. Berfokus pada registrasi cepat, klasifikasi otomatis, dan validasi awal dokumen tiket aduan.",
    icon: <Headphones className="h-4 w-4 text-[#36a7e3]" />,
    borderColor: "border-neutral-200/80 border-t-4 border-t-[#36a7e3] hover:border-neutral-400",
  },
  {
    id: "noc",
    title: "NOC Infrastructure",
    desc: "Network Operations Center. Analisis telemetri jaringan mendalam, eksekusi pemulihan jarak jauh (remote), serta orkestrasi delegasi penugasan teknis.",
    icon: <Activity className="h-4 w-4 text-[#e8ae0c]" />,
    borderColor: "border-neutral-200/80 border-t-4 border-t-[#e8ae0c] hover:border-neutral-400",
  },
  {
    id: "technical",
    title: "Field Engineering",
    desc: "Akses lembar kerja teknisi lapangan langsung di lokasi gangguan. Eksekusi perbaikan fisik, pembaruan redaman optik, dan unggah berkas penutupan.",
    icon: <Wrench className="h-4 w-4 text-[#36a7e3]" />,
    borderColor: "border-neutral-200/80 border-t-4 border-t-[#36a7e3] hover:border-neutral-400",
  },
];

function Index() {
  const router = useRouter();
  const [searchId, setSearchId] = useState("");

  const handleTrackTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = searchId.trim().replace("#", "");
    if (!cleanId) {
      toast.error("Silakan masukkan ID tiket Anda.");
      return;
    }
    router.navigate({ to: `/tracker/${cleanId}` });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col font-sans antialiased">

      {/* HEADER UTAMA PLATFORM */}
      <header className="h-16 px-8 border-b border-neutral-200/60 bg-white flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          {/* INTEGRASI LOGO BARU ANDA */}
          <div className="h-8 w-8 overflow-hidden flex items-center justify-center rounded-lg select-none">
            <img
              src="/logo.png"
              alt="Logo SIPATEN"
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <div className="font-black text-sm tracking-tight text-neutral-900 leading-none">SIPATEN</div>
            <div className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase mt-1">Telecom Workspace</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.navigate({ to: "/login" })}
            className="text-xs font-bold uppercase border-neutral-300 text-neutral-600 hover:bg-neutral-50 shadow-sm rounded-lg"
          >
            Staff Portal
          </Button>
        </div>
      </header>

      {/* GRADIENT AURORA LIGHT HERO SECTION */}
      <section className="relative bg-white border-b border-neutral-200/60 overflow-hidden">
        {/* Pola Grid Efek Spasial */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#eef0f2_1px,transparent_1px),linear-gradient(to_bottom,#eef0f2_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-60" />

        {/* Pendaran Gradien Warna Utama SIPATEN */}
        <div
          className="absolute inset-0 opacity-[0.14] pointer-events-none"
          style={{
            background: "radial-gradient(circle at 75% 30%, #36a7e3 0%, transparent 45%), radial-gradient(circle at 25% 70%, #e8ae0c 0%, transparent 50%)",
          }}
        />

        {/* Ambient Spot Soft Blur Blur */}
        <div className="absolute right-10 top-1/4 h-96 w-96 rounded-full bg-[#36a7e3]/10 blur-[130px] pointer-events-none" />
        <div className="absolute left-10 bottom-0 h-96 w-96 rounded-full bg-[#e8ae0c]/10 blur-[130px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-8 py-20 md:py-28 relative z-10 grid md:grid-cols-6 gap-8 items-center">

          {/* SISI KIRI: JUDUL PRODUK */}
          <div className="md:col-span-3 space-y-6 text-left">
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.15] text-neutral-900">
              Sistem Integrasi Penanganan Tiket Jaringan.
            </h2>

            <p className="text-sm md:text-base text-neutral-500 font-medium leading-relaxed max-w-xl">
              SIPATEN menyatukan operasi infrastruktur telekomunikasi dalam satu workstation terpadu. Mengatur alur penugasan dari <span className="font-bold text-[#36a7e3]">Helpdesk</span>, koordinasi <span className="font-bold text-[#e8ae0c]">NOC</span>, hingga eksekusi fisik <span className="font-bold text-[#36a7e3]">Technical</span> secara presisi.
            </p>
          </div>

          {/* SISI KANAN: TRACKING FORM BAR */}
          <div className="md:col-span-3 flex justify-end">
            <Card className="w-full max-w-sm p-6 bg-white/90 border border-neutral-200/80 shadow-xl rounded-2xl text-neutral-900 space-y-4 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#36a7e3] to-[#e8ae0c]" />
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Public Live Tracking</h3>
                <h4 className="text-base font-black text-neutral-900 mt-1">Lacak Status Kendala</h4>
                <p className="text-[11px] font-medium text-neutral-400 mt-0.5 leading-relaxed">
                  Pelanggan dapat memantau grafik perbaikan redaman dan posisi teknisi secara langsung tanpa perlu masuk ke dalam sistem.
                </p>
              </div>

              <form onSubmit={handleTrackTicket} className="space-y-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <Input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Masukkan ID Tiket (Contoh: TCK-2026...)"
                    className="pl-9 text-xs font-semibold border-neutral-200 focus-visible:ring-neutral-950 bg-neutral-50/50 h-10 rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs uppercase tracking-wider h-10 shadow-sm rounded-xl">
                  Mulai Pelacakan Real-time
                </Button>
              </form>
            </Card>
          </div>

        </div>
      </section>

      {/* CORE PORTAL GATEWAY SECTION */}
      <section className="max-w-6xl w-full mx-auto px-8 py-16 relative z-20">
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <Card
              key={r.id}
              onClick={() => router.navigate({ to: "/login" })}
              className={`group p-6 cursor-pointer bg-white border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between rounded-xl ${r.borderColor}`}
            >
              <div className="space-y-4">
                <div className="h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center shadow-inner">
                  {r.icon}
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide text-neutral-900">
                    {r.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-medium">
                    {r.desc}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-neutral-400 group-hover:text-neutral-900 transition-colors">
                <span>Access Workstation</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform duration-200 text-neutral-400 group-hover:text-neutral-900" />
              </div>
            </Card>
          ))}
        </div>

        {/* ECOSYSTEM CAPABILITIES INTRODUCTION */}
        <div className="mt-24 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-[10px] font-black text-[#36a7e3] uppercase tracking-widest">Automation Matrix</h3>
            <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Otomatisasi Engine Berkas Tugas</h2>
            <p className="text-xs font-medium text-neutral-400 leading-relaxed">
              SIPATEN memotong birokrasi koordinasi manual antar-divisi menggunakan otomatisasi webhook log terintegrasi.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CapabilityCard
              icon={<Bot className="h-4 w-4 text-[#36a7e3]" />}
              title="Instant WA Notification"
              desc="Setiap perubahan status tiket memicu pengiriman bukti mutasi log ke WhatsApp pelanggan secara asinkronus."
            />
            <CapabilityCard
              icon={<Network className="h-4 w-4 text-[#e8ae0c]" />}
              title="Smart Dispatcher"
              desc="Sistem NOC memetakan ketersediaan beban teknisi secara real-time berdasarkan status Available atau Busy."
            />
            <CapabilityCard
              icon={<ServerCrash className="h-4 w-4 text-[#36a7e3]" />}
              title="Telemetry Integrity"
              desc="Pencatatan riwayat kerusakan terpusat dari laporan redaman OPM (Optical Power Meter) untuk keperluan audit."
            />
            <CapabilityCard
              icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
              title="Enterprise Security"
              desc="Perjalanan perlindungan otentikasi ketat menggunakan sandi terenkripsi dan pembatasan hak akses berbasis token berkala."
            />
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-neutral-200 bg-white py-5 px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider gap-3">
        <div>SIPATEN Platform Engine &bull; Core Infrastructure Systems</div>
      </footer>
    </div>
  );
}

function CapabilityCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="p-5 border-neutral-200/60 bg-white rounded-xl space-y-3 shadow-sm">
      <div className="h-7 w-7 rounded-md bg-neutral-50 border border-neutral-200/50 flex items-center justify-center shadow-inner">
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wide">{title}</h4>
        <p className="text-[11px] font-medium text-neutral-400 mt-1 leading-relaxed">{desc}</p>
      </div>
    </Card>
  );
}