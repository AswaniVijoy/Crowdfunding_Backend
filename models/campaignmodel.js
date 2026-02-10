import { Schema } from "mongoose";
import { model } from "mongoose";

const campaignSchema = new Schema({
    Title: { type: String, unique: true },
    Category: String,
    Goal: Number,
    Raised: Number,
    Status: String
});

const Campaign = model("Campaign", campaignSchema);

export default Campaign;
