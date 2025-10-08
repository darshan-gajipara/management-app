import mongoose from "mongoose";

const WorkSpaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    adminId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Users", 
      required: false 
    },
    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
  },
  { timestamps: true }
);

const WorkSpace = mongoose.models.WorkSpaces || mongoose.model("WorkSpaces", WorkSpaceSchema);

export default WorkSpace;
