import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  Donar: String,
  CampaignTitle: String,
  Amount: Number,
  Date: {
    type: Date,
    default: Date.now
  }
});

export const Donation = mongoose.model("Donation", donationSchema);
