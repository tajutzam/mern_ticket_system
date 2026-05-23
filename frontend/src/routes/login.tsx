import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useSipaten, type Role } from "@/lib/sipaten-store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Lock, Mail, Loader2, Zap } from "lucide-react";
import { useLoginMutation } from "@/hooks/api/useAuthMutations";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Login — SIPATEN Workstation" },
      { name: "description", content: "Masuk ke Sistem Penanganan Tiket SIPATEN" },
    ],
  }),
});

function Login() {
  const { setRole } = useSipaten();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate, isPending } = useLoginMutation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    mutate(
      { email, password },
      {
        onSuccess: (response) => {
          // Ambil role dari response dan ubah ke lowercase agar sesuai dengan state client
          const backendRole = response.user.role.toLowerCase() as Role;
          
          // Simpan role ke sipaten-store global state
          setRole(backendRole);
          
          // Arahkan user ke dashboard yang sesuai secara dinamis
          router.navigate({ to: `/${backendRole}` });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col md:flex-row font-sans antialiased relative overflow-hidden">
      
      {/* BACKGROUND GRAPHIC EFFECTS (AURORA THEME) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#eef0f2_1px,transparent_1px),linear-gradient(to_bottom,#eef0f2_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-60 z-0" />
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 20% 30%, #36a7e3 0%, transparent 50%), radial-gradient(circle at 80% 70%, #e8ae0c 0%, transparent 50%)",
        }}
      />
      
      <div className="relative md:w-[45%] p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-200/60 bg-white/60 backdrop-blur-sm z-10">
        
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 overflow-hidden flex items-center justify-center rounded-lg select-none shrink-0">
            <img 
              src="/logo.png" 
              alt="Logo SIPATEN" 
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <span className="font-black text-sm tracking-tight text-neutral-900 block">SIPATEN</span>
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mt-1">Telecom Workspace</span>
          </div>
        </div>

        <div className="my-auto pt-16 md:pt-0 max-w-sm space-y-5">
         
          <h1 className="text-3xl font-black tracking-tight leading-[1.15] text-neutral-900 uppercase">
            Satu Pintu Workspace Operasional.
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 font-medium leading-relaxed">
            Sistem monitoring terpusat yang menghubungkan petugas lapangan, helpdesk, dan unit NOC secara real-time demi meminimalisir waktu pemulihan link infrastruktur.
          </p>
        </div>

        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-8 md:mt-0">
          &copy; 2026 SIPATEN Ecosystem &bull; Secure Node Environment
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 z-10">
        <div className="w-full max-w-95 space-y-6">
          
          <div className="space-y-1.5 text-center md:text-left">
            <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Operator Portal</h2>
            <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Selamat Datang</h3>
            <p className="text-xs text-neutral-400 font-medium">
              Silakan validasi identifikasi kredensial penugasan Anda.
            </p>
          </div>

          {/* KARTU FORMULIR */}
          <Card className="p-6 bg-white border border-neutral-200/80 shadow-xl rounded-2xl relative overflow-hidden">
            {/* Top Indicator Accent Gradient bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#36a7e3] to-[#e8ae0c]" />
            
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* FIELD INPUT EMAIL */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Email Kerja</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-950 text-xs font-semibold h-10 rounded-xl"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* FIELD INPUT PASSWORD */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Password Kunci</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-950 text-xs font-semibold h-10 rounded-xl"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* BUTTON SUBMIT DENGAN INDIKATOR LOADING */}
              <Button 
                type="submit" 
                className="w-full bg-[#36a7e3] hover:bg-[#2b8cc0] text-white text-xs font-black uppercase tracking-wider h-10 rounded-xl shadow-md mt-2 flex items-center justify-center gap-1.5"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Memverifikasi Hak Akses...
                  </>
                ) : (
                  "Masuk Ke Workstation"
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>

    </div>
  );
}