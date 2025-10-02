import AxiosApi from "@/lib/axios";
import { Task, TaskApiResponse } from "@/store/useTaskStore";

export async function fetchTasks(quarry:string,page:number,limit:number,createdAt:Date | undefined): Promise<TaskApiResponse> {
    const res = await AxiosApi.get(`/task/get?page=${page}&limit=${limit}&search=${quarry}&createdAt=${createdAt ? createdAt.toISOString() : ''}`);
    return res.data;
}

export async function addTask(
    value: Omit<Task, "_id" | "createdAt" | "updatedAt" | "__v">
): Promise<Task[]> {
    await AxiosApi.post("/task/add", value);
    const res = await AxiosApi.get("/task/get");
    return res.data;
}

export async function updateTask(
    id: string,
    value: Partial<Task>
): Promise<Task[]> {
    await AxiosApi.put(`/task/update/${id}`, value);
    const res = await AxiosApi.get("/task/get");
    return res.data;
}

export async function deleteTask(id: string): Promise<Task[]> {
    await AxiosApi.delete(`/task/delete/${id}`);
    const res = await AxiosApi.get("/task/get");
    return res.data;
}