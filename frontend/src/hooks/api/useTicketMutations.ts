import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axiosInstance"; 
import {
  fetchAllTickets,
  fetchTicketById,
  createTicketRequest,
  confirmTicketRequest,
  resolveTicketRemoteRequest,
  CreateTicketInput,
  updateTicketRequest,
  deleteTicketRequest,
  fetchDashboardStats,
} from "@/api/ticket";

export const useTickets = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["tickets", page, limit],
    queryFn: () => fetchAllTickets(page, limit),
    staleTime: 1000 * 30,
    placeholderData: (previousData) => previousData, 
  });
};

export const useTicketDetail = (id: string) => {
  return useQuery({
    queryKey: ["tickets", id],
    queryFn: () => fetchTicketById(id),
    enabled: !!id, 
  });
};

export const useGetTechnicians = () => {
  return useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const response = await api.get("/users?role=Technical");
      return response.data;
    },
    staleTime: 1000 * 15, 
  });
};


export const useUpdateTicketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTicketRequest,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets", variables.id] });
    },
  });
};

export const useDeleteTicketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTicketRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useCreateTicketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketData: CreateTicketInput) => createTicketRequest(ticketData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || "Gagal membuat tiket baru.";
      alert(errMsg);
    },
  });
};

export const useConfirmTicketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmTicketRequest(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets", id] });
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || "Gagal mengonfirmasi tiket.";
      alert(errMsg);
    },
  });
};

export const useResolveTicketRemoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      resolveTicketRemoteRequest({ id, note }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["waLogs", variables.id] }); // Invalidate log WA jika ada perubahan log otomatis
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || "Gagal menyelesaikan tiket secara remote.";
      alert(errMsg);
    },
  });
};

export const useAssignTicketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { technicianId: string; note: string; priority: string } }) => {
      const response = await api.post("/assignments", { ticketId: id, ...payload });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
    },
  });
};

export const useUpdateTechStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "Available" | "Busy" }) => {
      const response = await api.put(`/users/${id}/status`, { availabilityStatus: status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
    },
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 30,
  });
};

export const useTrackTicketPublic = (ticketId: string) => {
  return useQuery({
    queryKey: ["publicTrack", ticketId],
    queryFn: async () => {
      const res = await api.get(`/tickets/track/${ticketId}`);
      return res.data;
    },
    enabled: !!ticketId,
    staleTime: 1000 * 2,
  });
};