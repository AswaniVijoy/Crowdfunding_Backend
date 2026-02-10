import { Schema } from "mongoose";
import { model } from "mongoose";

const userSchema = new Schema({
    
    UserName: { type: String, required: true, unique: true },
    Password: String,
    Email:String,
    UserRole: { type: String, enum: ['admin', 'user'], required: true }
});
const User = model("User", userSchema);

export default User;