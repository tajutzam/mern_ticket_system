import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useSipaten, type Role } from "@/lib/sipaten-store";
import { Card } from "@/components/ui/card";
import { Headphones, Activity, Wrench, Radio, ArrowRight, Layers } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SIPATEN — Sistem Penanganan Tiket" },
      {
        name: "description",
        content: "SIPATEN — Integrated ticketing system untuk Helpdesk, NOC, dan Technical.",
      },
    ],
  }),
});

const roles: {
  id: Role;
  title: string;
  desc: string;
  icon: React.ReactNode;
  path: string;
  borderColor: string;
  hoverIconBg: string;
}[] = [
  {
    id: "helpdesk",
    title: "Helpdesk",
    desc: "Garda utama penerima laporan gangguan customer. Fokus pada registrasi, klasifikasi, dan konfirmasi awal tiket.",
    icon: <Headphones className="h-5 w-5" />,
    path: "/helpdesk",
    borderColor: "border-l-[#36a7e3]",
    hoverIconBg: "group-hover:bg-[#36a7e3]",
  },
  {
    id: "noc",
    title: "NOC",
    desc: "Network Operations Center. Analisis mendalam stabilitas jaringan, eksekusi remote recovery, atau delegasi tugas lapangan.",
    icon: <Activity className="h-5 w-5" />,
    path: "/noc",
    borderColor: "border-l-[#e8ae0c]",
    hoverIconBg: "group-hover:bg-[#e8ae0c]",
  },
  {
    id: "technical",
    title: "Technical",
    desc: "Teknisi lapangan (Field Engineer). Eksekusi perbaikan onsite, update progress berkala, dan penyerahan bukti dokumentasi.",
    icon: <Wrench className="h-5 w-5" />,
    path: "/technical",
    borderColor: "border-l-[#36a7e3]",
    hoverIconBg: "group-hover:bg-[#36a7e3]",
  },
];

function Index() {
  const { setRole } = useSipaten();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-between">
      
      <div 
        className="relative overflow-hidden py-20 px-8 text-white border-b border-neutral-200"
        style={{
          background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
        }}
      >
        <div 
          className="absolute right-1/4 top-0 h-80 w-80 rounded-full blur-[100px] opacity-20"
          style={{ backgroundColor: "#36a7e3" }}
        />
        <div 
          className="absolute left-1/4 bottom-0 h-64 w-64 rounded-full blur-[120px] opacity-15"
          style={{ backgroundColor: "#e8ae0c" }}
        />
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />

        <div className="max-w-5xl mx-auto relative flex flex-col items-center text-center">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-neutral-800/80 border border-neutral-700/60 backdrop-blur mb-6">
            <Radio className="h-4 w-4 animate-pulse" style={{ color: "#e8ae0c" }} />
            <span className="text-[11px] font-bold tracking-widest uppercase text-neutral-300">
              SIPATEN v2.0
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl leading-[1.15]">
            Sistem Integrasi Penanganan Tiket Jaringan
          </h1>
          <p className="mt-4 max-w-2xl text-base text-neutral-400 font-medium">
            Satu platform terpadu menggunakan skema alur <span style={{ color: "#36a7e3" }} className="font-semibold">Helpdesk</span>, <span style={{ color: "#e8ae0c" }} className="font-semibold">NOC</span>, dan <span style={{ color: "#36a7e3" }} className="font-semibold">Technical</span> demi resolusi jaringan yang cepat.
          </p>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto px-8 -mt-12 pb-12 relative flex-1">
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <Card
              key={r.id}
              onClick={() => {
                router.navigate({to : "/login"})
              }}
              className={`group p-6 cursor-pointer bg-white border border-neutral-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border-l-4 ${r.borderColor}`}
            >
              <div>
                <div className={`h-10 w-10 rounded-lg bg-neutral-100 text-neutral-700 grid place-items-center mb-5 ${r.hoverIconBg} group-hover:text-white transition-colors duration-300`}>
                  {r.icon}
                </div>
                <h3 className="font-bold text-lg text-neutral-900">
                  Portal {r.title}
                </h3>
                <p className="text-sm text-neutral-500 mt-2.5 leading-relaxed font-medium">
                  {r.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-sm font-semibold text-neutral-800">
                <span className="group-hover:text-neutral-950 transition-colors">Masuk Dashboard</span>
                <div 
                  className="h-7 w-7 rounded-full bg-neutral-50 flex items-center justify-center transition-all duration-200"
                  style={{ '--hover-bg': r.id === 'noc' ? '#e8ae0c' : '#36a7e3' } as React.CSSProperties}
                >
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 border border-neutral-200 bg-neutral-100/70 rounded-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="h-4 w-4 text-neutral-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Alur Kerja Transparan & Otomatis
            </h4>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="relative">
              <div className="flex items-center gap-2.5 font-bold text-sm text-neutral-900 mb-2">
                <span className="h-5 w-5 rounded text-white text-xs flex items-center justify-center font-mono font-bold" style={{ backgroundColor: "#36a7e3" }}>1</span>
                <span>Registrasi & Notifikasi</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed pl-7 font-medium">
                Helpdesk menerima gangguan, menerbitkan ID tiket otomatis, dan mengirimkan bukti laporan awal langsung ke WhatsApp Customer.
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center gap-2.5 font-bold text-sm text-neutral-900 mb-2">
                <span className="h-5 w-5 rounded text-white text-xs flex items-center justify-center font-mono font-bold" style={{ backgroundColor: "#e8ae0c" }}>2</span>
                <span>Analisis & Eskalasi</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed pl-7 font-medium">
                NOC mendiagnosis infrastruktur. Jika penyelesaian kendala membutuhkan tindakan fisik, sistem mencarikan teknisi berstatus *Available*.
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center gap-2.5 font-bold text-sm text-neutral-900 mb-2">
                <span className="h-5 w-5 rounded text-white text-xs flex items-center justify-center font-mono font-bold" style={{ backgroundColor: "#36a7e3" }}>3</span>
                <span>Eksekusi Lapangan</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed pl-7 font-medium">
                Teknisi melakukan *update progress* real-time. Setelah laporan selesai diunggah, tiket otomatis *Closed* dan mengirimkan notifikasi WA penutupan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="w-full border-t border-neutral-200 bg-white py-4 px-8 text-center text-xs text-neutral-400 font-medium">
        SIPATEN Ticketing Workspace &bull; Managed Infrastructure Environment
      </footer>
    </div>
  );
}