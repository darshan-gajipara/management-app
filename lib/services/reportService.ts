import AxiosApi from "@/lib/axios";
import { Report, ReportApiResponse } from "@/store/useReportStore";


export async function fetchReports(quarry:string,page:number,limit:number): Promise<ReportApiResponse> {
    const res = await AxiosApi.get(`/reports/get?page=${page}&limit=${limit}&search=${quarry}`);
    return res.data;
}

export async function addReport(
    value: Omit<Report, "_id" | "createdAt" | "updatedAt" | "__v">
): Promise<Report[]> {
    await AxiosApi.post("/reports/add", value);
    const res = await AxiosApi.get("/reports/get");
    return res.data;
}

export async function updateReport(
    id: string,
    value: Partial<Report>
): Promise<Report[]> {
    await AxiosApi.put(`/reports/update/${id}`, value);
    const res = await AxiosApi.get("/reports/get");
    return res.data;
}

export async function deleteReport(id: string): Promise<Report[]> {
    await AxiosApi.delete(`/reports/delete/${id}`);
    const res = await AxiosApi.get("/reports/get");
    return res.data;
}
