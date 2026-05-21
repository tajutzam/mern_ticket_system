import { api } from "@/api/axiosInstance";

export interface StatusHistory {
  status: "OPEN" | "CONFIRMED" | "ASSIGNED" | "IN PROGRESS" | "ON SITE" | "RESOLVED" | "CLOSED";
  updatedBy: string | { _id: string; name: string; role: string };
  updatedAt: string;
  note: string;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  customerName: string;
  phoneNumber: string;
  issueTitle: string;
  description: string;
  category: string;
  status: StatusHistory["status"];
  createdBy: { _id: string; name: string; email: string; role: string };
  resolvedBy?: { _id: string; name: string; email: string; role: string };
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  customerName: string;
  phoneNumber: string;
  issueTitle: string;
  description: string;
  category: string;
}


export interface PaginationMetadata {
  totalResults: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TicketsResponse {
  status: string;
  results: number;
  pagination: PaginationMetadata;
  data: Ticket[];
}

export const fetchAllTickets = async (page = 1, limit = 10): Promise<TicketsResponse> => {
  const response = await api.get(`/tickets?page=${page}&limit=${limit}`);
  return response.data;
};


export const fetchTicketById = async (id: string): Promise<{ status: string; data: Ticket }> => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const createTicketRequest = async (ticketData: CreateTicketInput) => {
  const response = await api.post("/tickets", ticketData);
  return response.data;
};

export const confirmTicketRequest = async (id: string) => {
  const response = await api.patch(`/tickets/${id}/confirm`);
  return response.data;
};

export const resolveTicketRemoteRequest = async ({ id, note }: { id: string; note?: string }) => {
  const response = await api.patch(`/tickets/${id}/resolve-remote`, { note });
  return response.data;
};



export const updateTicketRequest = async ({ id, data }: { id: string; data: Partial<CreateTicketInput> }) => {
  const response = await api.put(`/tickets/${id}`, data);
  return response.data;
};

export const deleteTicketRequest = async (id: string) => {
  const response = await api.delete(`/tickets/${id}`);
  return response.data;
};


export const fetchDashboardStats = async () => {
  const res = await api.get("/tickets/dashboard-stats");
  console.log(res)
  return res.data; 
};