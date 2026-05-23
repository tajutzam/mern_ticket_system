import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axiosInstance";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, AppLayout } from "@/components/AppLayout";
import { 
  Plus, Search, Edit2, Trash2, Shield, Loader2, Phone
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/helpdesk/users")({
  component: HelpdeskUsersManagement,
});

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: "helpdesk" | "noc" | "technical" | "customer";
  availabilityStatus?: "Available" | "Busy";
  phoneNumber: string;
}

function HelpdeskUsersManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // State Form Input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<string>("technical");

  // 1. Ambil Data User Staf
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data;
    },
  });

  const users: UserItem[] = usersResponse?.data || [];

  // 2. Mutation: Create User
  const createUserMutation = useMutation({
    mutationFn: async (newData: any) => {
      return await api.post("/users", newData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      toast.success("Akun petugas baru berhasil didaftarkan.");
      closeDialog();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal membuat user.");
    },
  });

  // 3. Mutation: Update User
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updateData }: { id: string; updateData: any }) => {
      return await api.put(`/users/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      toast.success("Informasi akun petugas berhasil diperbarui.");
      closeDialog();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal memperbarui user.");
    },
  });

  // 4. Mutation: Delete User
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      toast.success("Akun petugas berhasil dihapus dari sistem.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal menghapus user.");
    },
  });

  const openAddDialog = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setPhoneNumber("");
    setRole("technical");
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: UserItem) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(""); 
    setPhoneNumber(user.phoneNumber || "");
    setRole(user.role);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setPhoneNumber("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      name,
      email,
      role,
      phoneNumber,
    };

    if (!editingUser || password.trim()) {
      payload.password = password;
    }

    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser._id, updateData: payload });
    } else {
      createUserMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus akun petugas ini secara permanen?")) {
      deleteUserMutation.mutate(id);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout role="helpdesk">
      <div className="flex-1 flex flex-col bg-[#fafafa]">
        <PageHeader
          title="User Management"
          subtitle="Kelola kredensial, peran divisi, nomor WhatsApp, dan status operasional staf."
          actions={
            <Button
              size="sm"
              onClick={openAddDialog}
              className="bg-[#36a7e3] hover:bg-[#2b8cc0] text-white text-xs font-black uppercase tracking-wider gap-1.5 h-9 rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4" /> Registrasi Petugas
            </Button>
          }
        />

        <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
          
          {/* BILAH PENCARIAN (SEARCH BAR) */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Cari nama atau email petugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-neutral-200 text-xs font-semibold h-10 rounded-xl"
            />
          </div>

          {/* TABEL MASTER DATA USER */}
          <Card className="border-neutral-200/80 shadow-sm rounded-xl overflow-hidden bg-white">
            {isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 text-[#36a7e3] animate-spin" />
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Sinkronisasi Database Staf...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-xs font-medium text-neutral-400">
                Tidak ada data petugas yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-neutral-50/70">
                  <TableRow className="border-neutral-200/60">
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Nama Petugas</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Email Kerja</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-neutral-400">WhatsApp / Telepon</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Divisi Peran</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Status Tugas</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-wider text-neutral-400 pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u._id} className="border-neutral-150 hover:bg-neutral-50/50 transition-colors">
                      <TableCell className="font-bold text-neutral-800 text-sm">{u.name}</TableCell>
                      <TableCell className="font-mono text-xs text-neutral-500">{u.email}</TableCell>
                      <TableCell className="font-medium text-neutral-600 text-xs">{u.phoneNumber || "—"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-600">
                          <Shield className="h-3 w-3 text-[#36a7e3]" /> {u.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {u.role === "technical" ? (
                          <span className={`text-[10px] font-black uppercase tracking-wider ${
                            u.availabilityStatus === "Available" ? "text-emerald-600" : "text-amber-500"
                          }`}>
                            &bull; {u.availabilityStatus || "Available"}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-300 font-medium">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-4 space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(u)}
                          className="h-8 w-8 text-neutral-400 hover:text-neutral-900 rounded-lg"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(u._id)}
                          className="h-8 w-8 text-neutral-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        {/* DIALOG MODAL ADD / EDIT USER */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="sm:max-w-[420px] rounded-2xl bg-white border border-neutral-200 p-6 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-neutral-900 uppercase tracking-tight">
                {editingUser ? "Edit Profil Petugas" : "Registrasi Akun Petugas Baru"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Nama Lengkap</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Mohammad Zam"
                  className="bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-950 text-xs font-semibold h-10 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Email Kerja</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    className="bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-950 text-xs font-semibold h-10 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">No. WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <Input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="628222..."
                      className="pl-9 bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-950 text-xs font-semibold h-10 rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Password {editingUser && <span className="text-[9px] text-amber-600 normal-case font-normal">(Kosongkan jika tidak diubah)</span>}
                </Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-950 text-xs font-semibold h-10 rounded-xl"
                  required={!editingUser}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Divisi Peran</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-neutral-50/50 border-neutral-200 text-xs font-semibold h-10 rounded-xl">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-neutral-200 rounded-xl">
                    <SelectItem value="helpdesk" className="text-xs font-semibold">Helpdesk</SelectItem>
                    <SelectItem value="noc" className="text-xs font-semibold">NOC</SelectItem>
                    <SelectItem value="technical" className="text-xs font-semibold">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-4 border-t border-neutral-100 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  className="text-xs font-bold uppercase border-neutral-200 text-neutral-500 hover:bg-neutral-50 rounded-xl h-10 shadow-sm"
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  className="bg-[#36a7e3] hover:bg-[#2b8cc0] text-white text-xs font-black uppercase tracking-wider rounded-xl h-10 shadow-md flex items-center justify-center min-w-[120px]"
                >
                  {createUserMutation.isPending || updateUserMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingUser ? (
                    "Simpan Perubahan"
                  ) : (
                    "Buat Akun"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}