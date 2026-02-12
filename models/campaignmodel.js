import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  Title: { type: String, required: true },
  Description: String,
  Category: String,
  Goal: Number,
  Raised: { type: Number, default: 0 },

  Image: String, // Base64 image

  Status: {
    type: String,
    enum: [ "Active", "Closed"],
    default: "Active"
  },

  CreatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Campaign = mongoose.model("Campaign", campaignSchema);
