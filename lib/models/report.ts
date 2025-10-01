import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        author: { type: String, required: true },
        type: { type: String, required: true },
        status: { type: Boolean, required: true },
    },
    {timestamps:true}
)

const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);

export default Report;