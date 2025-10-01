"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { Loader } from "lucide-react";
import { useReportsStore } from "@/store/useReportStore";
import { useEffect } from "react";
import axios from "axios";

type ReportForm = {
  title: string;
  content: string;
  author: string;
  type: string;
  status: boolean;
};

type Props = {
  closeBtnRef?: React.RefObject<HTMLButtonElement | null>;
  reportID?: string;
};

export default function CreateReportComponent({ reportID, closeBtnRef }: Props) {
  const { addReport, getAllReports, updateReport, loading } = useReportsStore();
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<ReportForm>();

  useEffect(() => {
    if (!reportID) return;

    const token = localStorage.getItem("token");

    const config = token
      ? {
        headers: { Authorization: `Bearer ${token}` },
      }
      : {};

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/reports/get/${reportID}`, config)
      .then((res) => {
        console.log(res.data);
        const report = res.data;
        setValue("title", report.title);
        setValue("content", report.content);
        setValue("author", report.author);
        setValue("type", report.type);
        setValue("status", report.status);
      })
      .catch((err) => console.log(err));
  }, [reportID, setValue]);

  const onSubmit = async (data: ReportForm) => {
    if (!reportID) {
      await addReport(data);
    } else {
      await updateReport(reportID!, data);
    }
    await getAllReports();

    if (closeBtnRef?.current) {
      closeBtnRef.current.click();
    }

  };

  return (
    <div className="w-full">
      {loading && <Loader size={32} className="mx-auto mb-4 animate-spin" />}
      <CardHeader className="pb-4">
        {/* <CardTitle>Create Report</CardTitle> */}
      </CardHeader>
      <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input {...register("title", { required: true })} type="text" />
            {errors.title && <p className="text-red-500 text-sm">Title is required</p>}
          </div>

          {/* Content */}
          <div className="grid gap-2">
            <Label>Content</Label>
            <Input {...register("content", { required: true })} type="text" />
            {errors.content && <p className="text-red-500 text-sm">Content is required</p>}
          </div>

          {/* Author */}
          <div className="grid gap-2">
            <Label>Author</Label>
            <Input {...register("author", { required: true })} type="text" />
            {errors.author && <p className="text-red-500 text-sm">Author is required</p>}
          </div>

          {/* Type (Select) */}
          <div className="grid gap-2">
            <Label>Type</Label>
            <Controller
              name="type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Activity">Activity</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-red-500 text-sm">Type is required</p>}
          </div>

          {/* Status (Checkbox) */}
          <div className="flex items-center space-x-2">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label>Status (Active)</Label>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            {reportID ? <Button type="submit" variant="secondary">Update</Button>
              : <Button type="submit" variant="secondary">Create</Button>}


          </div>
        </form>
      </CardContent>
    </div>
  );
}
