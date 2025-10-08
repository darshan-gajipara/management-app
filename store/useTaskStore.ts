import { create } from "zustand";
import { toast } from "sonner"
import { addTask, deleteTask, fetchTasks, updateTask } from "@/lib/services/taskService";

export type Task = {
    _id: string;
    title: string;
    description: string;
    group: string;
    currentStatus: string;
    scheduledDate: string;
    createdAt: string;
    updatedAt: string;
    __v: { $numberInt: string };
}

export type TaskRes = {
  _id: string;
  title: string;
  description: string;
  group: string;
  currentStatus: string;
  scheduledDate: string; // ISO date string
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export interface TaskApiResponse {
    data: TaskRes[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

type TaskStore = {
    tasks: Task[];
    taskResponse: TaskApiResponse | null
    loading: boolean;
    addtask: (value: Omit<Task, "_id" | "createdAt" | "updatedAt" | "__v">) => Promise<void>;
    getAllTasks: (quarry?: string, page?: number, limit?: number, createdAt?:Date) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    updateTask: (id: string, value: Partial<Task>) => Promise<void>;
};

export const useTaskStore = create<TaskStore>((set) => ({
    tasks: [],
    loading: false,
    taskResponse: null,

    getAllTasks: async (quarry?: string, page?: number, limit?: number, createdAt?:Date) => {
        if (!quarry && !page && !limit) {
            set({ loading: true });
        }
        try {
            const tasks = await fetchTasks(
                quarry || '',
                page || 1,
                limit || 10,
                createdAt ?? undefined 
            );
            set({ taskResponse: tasks });
        } catch (err) {
            console.error("Error fetching tasks:", err);
        } finally {
            set({ loading: false });
        }
    },

    addtask: async (task) => {
        set({ loading: true });
        try {
            const tasks = await addTask(task)
            set({ tasks: tasks });
        } catch (error) {
            console.error("Failed to add report:", error);
        } finally {
            set({ loading: false });
            toast.success("Task has been generated successfully");
        }
    },

    updateTask: async (id, value) => {
        set({ loading: true });
        try {
            const tasks = await updateTask(id, value);
            set({ tasks: tasks });
        } catch (err) {
            console.error("Error updating Task:", err);
        } finally {
            set({ loading: false });
            toast.success("Task has been updated successfully");
        }
    },

    deleteTask: async (id) => {
        set({ loading: true });
        try {
            const tasks = await deleteTask(id);
            set({ tasks: tasks });
        } catch (err) {
            console.error("Error deleting Task:", err);
        } finally {
            set({ loading: false });
            toast.success("Task has been deleted");
        }
    },

}))