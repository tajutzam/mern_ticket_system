import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axiosInstance";
import { PageHeader } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/api/useAuthMutations";
import { 
  User, Mail, ShieldCheck, KeyRound, 
  Loader2, Save, RefreshCw 
} from "lucide-react";
import { toast } from "sonner";

export function GeneralProfile({ roleLabel }: { roleLabel: string }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();
  const userData = user?.user || user;

  // State Form Data Personal
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // State Form Keamanan
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Efek untuk mengisi data awal form setelah data user selesai dimuat
  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setEmail(userData.email || "");
    }
  }, [userData]);

  // 1. Mutasi untuk Update Informasi Data Diri
  const updateInfoMutation = useMutation({
    mutationFn: async (updatedName: string) => {
      const res = await api.put("/profile/info", { name: updatedName });
      return res.data;
    },
    onSuccess: () => {
      // Validasi ulang cache data user agar nama baru langsung ter-update di Sidebar / Layout
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Informasi profil data diri berhasil diperbarui.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal memperbarui informasi personal.");
    },
  });

  // 2. Mutasi untuk Perubahan Kata Sandi Akun
  const changePasswordMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put("/profile/change-password", payload);
      return res.data;
    },
    onSuccess: () => {
      // Bersihkan form sandi jika proses di backend berhasil tuntas
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Kata sandi akun berhasil diubah. Sesi Anda tetap aman.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal memperbarui kata sandi.");
    },
  });

  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Komponen nama lengkap wajib diisi.");
      return;
    }
    updateInfoMutation.mutate(name);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Seluruh kolom verifikasi kata sandi wajib diisi.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Kata sandi baru minimal harus 6 karakter.");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  // State loading gabungan untuk menonaktifkan interaksi tombol form saat mutasi berjalan
  const isPendingMutation = updateInfoMutation.isPending || changePasswordMutation.isPending;

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 text-[#36a7e3] animate-spin" />
        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Menghimpun kredensial akun...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title="Account Configuration" 
        subtitle="Kelola konfigurasi data identitas diri dan parameter keamanan hak akses workstation Anda."
      />

      <div className="p-8 max-w-5xl grid md:grid-cols-3 gap-6">
        
        {/* PANEL DATA DIRI & KEAMANAN (KIRI - LEBAR 2/3) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* KARTU EDIT INFORMASI UTAMA */}
          <Card className="p-6 border-neutral-200/60 bg-white rounded-xl shadow-sm space-y-4">
            <h2 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-neutral-400" /> Informasi Data Personal
            </h2>
            
            <form onSubmit={handleUpdateInfo} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Nama Lengkap</label>
                <Input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPendingMutation}
                  className="focus-visible:ring-neutral-950 border-neutral-300 text-xs font-medium h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Alamat Email Sistem</label>
                <Input 
                  type="email" 
                  value={email} 
                  disabled
                  className="bg-neutral-50 border-neutral-200 text-xs font-medium text-neutral-400 cursor-not-allowed h-10 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2 pt-2 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isPendingMutation} 
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm transition-all flex items-center"
                >
                  {updateInfoMutation.isPending ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Card>

          {/* KARTU MODIFIKASI PASSWORD */}
          <Card className="p-6 border-neutral-200/60 bg-white rounded-xl shadow-sm space-y-4">
            <h2 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-neutral-400" /> Gatekeeper / Ubah Sandi Sesi
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Kata Sandi Saat Ini</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isPendingMutation}
                    className="focus-visible:ring-neutral-950 border-neutral-300 text-xs font-medium h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Kata Sandi Baru</label>
                  <Input 
                    type="password" 
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isPendingMutation}
                    className="focus-visible:ring-neutral-950 border-neutral-300 text-xs font-medium h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isPendingMutation} 
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm transition-all flex items-center"
                >
                  {changePasswordMutation.isPending ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
                  ) : (
                    <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Perbarui Kata Sandi
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* SIDE BAR INFO TINGKAT HAK AKSES */}
        <div className="space-y-4">
          <Card className="p-5 border-neutral-200/60 bg-white rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">Tingkat Hak Akses</h3>
            
            <div className="bg-neutral-950 text-white p-4 rounded-xl space-y-3 shadow-inner">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider leading-none">Security Level</div>
                  <div className="text-xs font-black text-neutral-100 mt-1">{roleLabel}</div>
                </div>
              </div>
              <div className="text-[10px] font-medium text-neutral-400 leading-relaxed border-t border-neutral-800 pt-2 font-mono">
                Akun terikat enkripsi JWT token. Segala log perubahan terekam di audit trail cluster server.
              </div>
            </div>
          </Card>
        </div>

      </div>
    </>
  );
}