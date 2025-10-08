import mongoose from "mongoose";
import "@/lib/models/user";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    group: {
      type: String,
      required: true,
      enum: ["Finance", "HR", "IT", "Sales"],
    },

    currentStatus: {
      type: String,
      required: true,
      enum: ["Pending", "In Progress", "Completed", "On Hold"],
      default: "Pending",
    },

    scheduledDate: { type: Date, required: true },

    // ✅ New field: Assigned User (Reference to User model)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: false, // you can make it required: true if needed
    },
  },
  { timestamps: true }
);

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;
