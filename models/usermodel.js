import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  UserName: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  UserRole: {
    type: String,
    enum: ["Admin", "User"],
    default: "User"
  }
});

export const User = mongoose.model("User", userSchema);
