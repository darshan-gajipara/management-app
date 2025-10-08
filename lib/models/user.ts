import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["Admin", "Member"], 
      required: true 
    },
    workspaceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "WorkSpaces", 
      default: null 
    },
  },
  { timestamps: true }
);

const User = mongoose.models.Users || mongoose.model("Users", UserSchema);

export default User;
