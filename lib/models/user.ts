import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
    },
    {timestamps:true}
)

const User = mongoose.models.Users || mongoose.model("Users", UserSchema);

export default User;