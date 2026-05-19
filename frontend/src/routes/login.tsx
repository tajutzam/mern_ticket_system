import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useSipaten, type Role } from "@/lib/sipaten-store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Radio, Lock, Mail} from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Login — SIPATEN" },
      { name: "description", content: "Masuk ke Sistem Penanganan Tiket SIPATEN" },
    ],
  }),
});

function Login() {
  const { setRole } = useSipaten();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (email.includes("noc")) {
        setRole("noc");
        router.navigate({ to: "/noc" });
      } else if (email.includes("tech")) {
        setRole("technical");
        router.navigate({ to: "/technical" });
      } else {
        setRole("helpdesk");
        router.navigate({ to: "/helpdesk" });
      }
    }, 800);
  };

 
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col md:flex-row">
      
      <div 
        className="relative md:w-[45%] bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 p-8 md:p-12 flex flex-col justify-between text-white border-b md:border-b-0 md:border-r border-neutral-800 overflow-hidden"
      >
        <div 
          className="absolute -right-10 top-10 h-72 w-72 rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ backgroundColor: "#36a7e3" }}
        />
        <div 
          className="absolute -left-10 bottom-10 h-72 w-72 rounded-full blur-[120px] opacity-15 pointer-events-none"
          style={{ backgroundColor: "#e8ae0c" }}
        />
        
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="h-9 w-9 rounded-lg bg-neutral-800 border border-neutral-700 grid place-items-center shadow-sm">
            <Radio className="h-5 w-5 animate-pulse" style={{ color: "#e8ae0c" }} />
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-sm block">SIPATEN</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest block -mt-1">Ticketing Engine</span>
          </div>
        </div>

        <div className="my-auto pt-12 pb-8 relative z-10 max-w-sm">
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            Satu Pintu untuk Seluruh Penanganan Kendala.
          </h1>
          <p className="mt-3 text-sm text-neutral-400 leading-relaxed font-medium">
            Sistem monitoring terpusat yang menghubungkan petugas operasional secara real-time demi meminimalisir waktu *downtime* jaringan.
          </p>
        </div>

        <div className="text-xs text-neutral-500 font-medium relative z-10">
          &copy; 2026 SIPATEN Ecosystem. All rights reserved.
        </div>
      </div>

      {/* PANEL KANAN: FORM LOGIN & QUICK ACCESS */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-neutral-50">
        <div className="w-full max-w-[400px] space-y-6">
          
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Selamat Datang</h2>
            <p className="text-sm text-neutral-500 font-medium">
              Silakan masuk menggunakan akun kredensial petugas Anda.
            </p>
          </div>

          <Card className="p-6 bg-white border border-neutral-200/80 shadow-md rounded-xl">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-neutral-700">Email Kerja</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-neutral-50/50 border-neutral-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-neutral-700">Password</Label>
                
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-neutral-50/50 border-neutral-200"
                    required
                  />
                </div>
              </div>

              {/* Tombol Log In menggunakan warna biru pilihan #36a7e3 */}
              <Button 
                type="submit" 
                className="w-full text-white font-semibold shadow-sm hover:opacity-90 transition-opacity mt-2"
                style={{ backgroundColor: "#36a7e3" }}
                disabled={isLoading}
              >
                {isLoading ? "Memverifikasi..." : "Masuk ke Sistem"}
              </Button>
            </form>
          </Card>
        </div>
      </div>

    </div>
  );
}