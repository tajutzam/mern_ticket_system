import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const safeStorage = () => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return window.localStorage;
};

export type TicketStatus =
  | "OPEN"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "ON_SITE"
  | "RESOLVED"
  | "CLOSED";

export type Role = "helpdesk" | "noc" | "technical";

export interface Technician {
  id: string;
  name: string;
  available: boolean;
}

export interface ProgressLog {
  ts: string;
  by: Role;
  note: string;
}

export interface WhatsAppLog {
  ts: string;
  to: string; // customer phone or technician name
  message: string;
}

export interface Ticket {
  id: string;
  customerName: string;
  phone: string;
  title: string;
  description: string;
  category: string;
  status: TicketStatus;
  createdAt: string;
  confirmedAt?: string;
  assignedTo?: string; // technician id
  assignmentNote?: string;
  priority?: "Low" | "Medium" | "High";
  progress: ProgressLog[];
  whatsapp: WhatsAppLog[];
  solution?: string;
  evidence?: string;
  closedAt?: string;
}

interface State {
  role: Role | null;
  tickets: Ticket[];
  technicians: Technician[];
  setRole: (r: Role | null) => void;
  createTicket: (
    t: Omit<
      Ticket,
      "id" | "status" | "createdAt" | "progress" | "whatsapp"
    >,
  ) => Ticket;
  confirmTicket: (id: string) => void;
  resolveRemote: (id: string, note: string) => void;
  assignTicket: (
    id: string,
    technicianId: string,
    note: string,
    priority: "Low" | "Medium" | "High",
  ) => void;
  acceptAssignment: (id: string) => void;
  addProgress: (id: string, note: string, onSite?: boolean) => void;
  submitReport: (
    id: string,
    solution: string,
    evidence: string,
  ) => void;
  setTechnicianBusy: (id: string, busy: boolean) => void;
  reset: () => void;
}

const seedTechnicians: Technician[] = [
  { id: "TC1", name: "TC 1 — Budi Santoso", available: true },
  { id: "TC2", name: "TC 2 — Andi Wijaya", available: false },
  { id: "TC3", name: "TC 3 — Rina Lestari", available: true },
  { id: "TC4", name: "TC 4 — Doni Pratama", available: true },
];

let counter = 0;
function nextId(existing: Ticket[]) {
  const max = existing.reduce((m, t) => {
    const n = parseInt(t.id.replace("#", ""), 10);
    return n > m ? n : m;
  }, 0);
  counter = Math.max(counter, max) + 1;
  return "#" + String(counter).padStart(3, "0");
}

const now = () => new Date().toISOString();

export const useSipaten = create<State>()(
  persist(
    (set, get) => ({
      role: null,
      tickets: [],
      technicians: seedTechnicians,
      setRole: (r) => set({ role: r }),
      createTicket: (t) => {
        const ticket: Ticket = {
          ...t,
          id: nextId(get().tickets),
          status: "OPEN",
          createdAt: now(),
          progress: [{ ts: now(), by: "helpdesk", note: "Ticket created" }],
          whatsapp: [],
        };
        set({ tickets: [ticket, ...get().tickets] });
        return ticket;
      },
      confirmTicket: (id) => {
        set({
          tickets: get().tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "CONFIRMED",
                  confirmedAt: now(),
                  progress: [
                    ...t.progress,
                    { ts: now(), by: "helpdesk", note: "Ticket confirmed" },
                  ],
                  whatsapp: [
                    ...t.whatsapp,
                    {
                      ts: now(),
                      to: t.phone,
                      message: `Halo ${t.customerName}, laporan Anda telah diterima.\nTicket ID: ${t.id}\nStatus: Confirmed`,
                    },
                  ],
                }
              : t,
          ),
        });
      },
      resolveRemote: (id, note) => {
        set({
          tickets: get().tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "CLOSED",
                  solution: note,
                  closedAt: now(),
                  progress: [
                    ...t.progress,
                    { ts: now(), by: "noc", note: `Resolved remote: ${note}` },
                  ],
                  whatsapp: [
                    ...t.whatsapp,
                    {
                      ts: now(),
                      to: t.phone,
                      message: `Halo ${t.customerName}, ticket Anda (${t.id}) berhasil diselesaikan secara remote.\nStatus: Closed`,
                    },
                  ],
                }
              : t,
          ),
        });
      },
      assignTicket: (id, techId, note, priority) => {
        const tech = get().technicians.find((x) => x.id === techId);
        set({
          tickets: get().tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "ASSIGNED",
                  assignedTo: techId,
                  assignmentNote: note,
                  priority,
                  progress: [
                    ...t.progress,
                    {
                      ts: now(),
                      by: "noc",
                      note: `Assigned to ${tech?.name} (${priority})`,
                    },
                  ],
                  whatsapp: [
                    ...t.whatsapp,
                    {
                      ts: now(),
                      to: tech?.name ?? techId,
                      message: `Halo ${tech?.name}, Anda mendapat assignment baru.\nTicket ID: ${t.id}\nIssue: ${t.title}\nPriority: ${priority}\nSilakan login ke SIPATEN.`,
                    },
                  ],
                }
              : t,
          ),
          technicians: get().technicians.map((x) =>
            x.id === techId ? { ...x, available: false } : x,
          ),
        });
      },
      acceptAssignment: (id) => {
        set({
          tickets: get().tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "IN_PROGRESS",
                  progress: [
                    ...t.progress,
                    {
                      ts: now(),
                      by: "technical",
                      note: "Assignment accepted",
                    },
                  ],
                }
              : t,
          ),
        });
      },
      addProgress: (id, note, onSite) => {
        set({
          tickets: get().tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: onSite ? "ON_SITE" : t.status,
                  progress: [
                    ...t.progress,
                    { ts: now(), by: "technical", note },
                  ],
                }
              : t,
          ),
        });
      },
      submitReport: (id, solution, evidence) => {
        set({
          tickets: get().tickets.map((t) => {
            if (t.id !== id) return t;
            return {
              ...t,
              status: "CLOSED",
              solution,
              evidence,
              closedAt: now(),
              progress: [
                ...t.progress,
                {
                  ts: now(),
                  by: "technical",
                  note: `Work report submitted: ${solution}`,
                },
              ],
              whatsapp: [
                ...t.whatsapp,
                {
                  ts: now(),
                  to: t.phone,
                  message: `Halo ${t.customerName}, ticket Anda (${t.id}) telah selesai ditangani.\nStatus: Closed`,
                },
              ],
            };
          }),
          technicians: t_freeTech(get().technicians, get().tickets, id),
        });
      },
      setTechnicianBusy: (id, busy) => {
        set({
          technicians: get().technicians.map((x) =>
            x.id === id ? { ...x, available: !busy } : x,
          ),
        });
      },
      reset: () =>
        set({ tickets: [], technicians: seedTechnicians, role: null }),
    }),
    { name: "sipaten-v1", storage: createJSONStorage(() => safeStorage()) },
  ),
);

function t_freeTech(
  techs: Technician[],
  tickets: Ticket[],
  closedTicketId: string,
): Technician[] {
  const closed = tickets.find((t) => t.id === closedTicketId);
  if (!closed?.assignedTo) return techs;
  return techs.map((x) =>
    x.id === closed.assignedTo ? { ...x, available: true } : x,
  );
}

export const statusLabel: Record<TicketStatus, string> = {
  OPEN: "Open",
  CONFIRMED: "Confirmed",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  ON_SITE: "On Site",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const statusColor: Record<TicketStatus, string> = {
  OPEN: "bg-muted text-muted-foreground",
  CONFIRMED: "bg-info/15 text-info",
  ASSIGNED: "bg-warning/20 text-warning-foreground",
  IN_PROGRESS: "bg-primary/15 text-primary",
  ON_SITE: "bg-accent/25 text-accent-foreground",
  RESOLVED: "bg-success/15 text-success",
  CLOSED: "bg-success/15 text-success",
};
