// /app/store/useReportsStore.ts
import { addReport, deleteReport, fetchReports, updateReport } from "@/lib/services/reportService";
import { create } from "zustand";
import { toast } from "sonner"

export type Report = {
  _id: string;
  title: string;
  content: string;
  author: string;
  type: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: { $numberInt: string };
};

export interface ReportApiResponse {
  data: Report[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type ReportsStore = {
  reports: Report[];
  reportResponse: ReportApiResponse | null
  loading: boolean;
  addReport: (value: Omit<Report, "_id" | "createdAt" | "updatedAt" | "__v">) => Promise<void>;
  getAllReports: (quarry?: string, page?: number, limit?: number) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  updateReport: (id: string, value: Partial<Report>) => Promise<void>;
};

export const useReportsStore = create<ReportsStore>((set) => ({
  reports: [],
  loading: false,
  reportResponse: null,

  getAllReports: async (quarry?: string, page?: number, limit?: number) => {
    if (!quarry && !page && !limit) {
      set({ loading: true });
    }
    try {
      const reports = await fetchReports((quarry || ''), (page || 1), (limit || 10));
      set({ reportResponse: reports });
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      set({ loading: false });
    }
  },

  addReport: async (report) => {
    set({ loading: true });
    try {
      const reports = await addReport(report)
      set({ reports: reports });
    } catch (error) {
      console.error("Failed to add report:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateReport: async (id, value) => {
    set({ loading: true });
    try {
      const reports = await updateReport(id, value);
      set({ reports: reports });
    } catch (err) {
      console.error("Error updating Report:", err);
    } finally {
      set({ loading: false });
      toast.success("Report has been updated successfully");
    }
  },

  deleteReport: async (id) => {
    set({ loading: true });
    try {
      const blogs = await deleteReport(id);
      set({ reports: blogs });
    } catch (err) {
      console.error("Error deleting blog:", err);
    } finally {
      set({ loading: false });
      toast.success("Report has been deleted");
    }
  },
}));
