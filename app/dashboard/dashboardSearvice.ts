import AxiosApi from "@/lib/axios";

export const getDashboardData = async () => {
    const res = await AxiosApi.get('/dashboard');
    return res.data;
  }