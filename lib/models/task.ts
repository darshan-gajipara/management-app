import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Group field as ENUM
    group: {
      type: String,
      required: true,
      enum: ["Finance", "HR", "IT", "Sales"], 
    },

    // Status field as ENUM
    currentStatus: {
      type: String,
      required: true,
      enum: ["Pending", "In Progress", "Completed", "On Hold"], // ✅ only these statuses
      default: "Pending",
    },

    scheduledDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Task =
  mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;
