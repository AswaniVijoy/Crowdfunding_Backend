import { Schema } from "mongoose";
import { model } from "mongoose";

const donationSchema = new Schema({
    Donar: String,
    Campaign: String,
    Amount: Number,
    Date: Date
});

const Donation = model("Donation", donationSchema);

export default Donation;
