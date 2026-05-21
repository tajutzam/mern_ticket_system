import { api } from "@/api/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// 1. Mengambil seluruh daftar penugasan milik pribadi teknisi yang login
export const useGetMyAssignments = () => {
  return useQuery({
    queryKey: ["myAssignments"],
    queryFn: async () => {
      const res = await api.get("/assignments/my-tasks");
      return res.data;
    },
    staleTime: 1000 * 20,
  });
};

// 2. Mengambil informasi detail satu lembar kerja penugasan berdasarkan ID
export const useGetAssignmentDetail = (id: string) => {
  return useQuery({
    queryKey: ["assignmentDetail", id],
    queryFn: async () => {
      const res = await api.get(`/assignments/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

// 3. Menyetujui / mengambil perintah kerja baru (Pending -> Accepted)
export const useAcceptAssignmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const res = await api.put(`/assignments/${assignmentId}/accept`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAssignments"] });
    },
  });
};

// 4. Memperbarui status alur kerja operasional di lapangan (On Site / In Progress / Resolved)
export const useUpdateStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "On Site" | "In Progress" | "Resolved" }) => {
      const res = await api.put(`/assignments/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignmentDetail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["myAssignments"] });
    },
  });
};

// 5. Mengirim berkas pelaporan kerja akhir dan menutup tiket penugasan (Submit Work Report)
export const useSubmitWorkReportMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { solution: string; finalNote: string; evidenceUrl?: string } }) => {
      const res = await api.post(`/assignments/${id}/report`, payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignmentDetail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["myAssignments"] });
    },
  });
};