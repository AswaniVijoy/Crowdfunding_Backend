import { Schema } from "mongoose";
import { model } from "mongoose";

const newcampaignSchema = new Schema({
    CampaignTitle: { type: String, unique: true },
    ShortDescription:String,
    FullDescription:String,
    GoalAmount:Number,
    Category: String,
    CampaignImage:String
});

const NewCampaign = model("NewCampaign", newcampaignSchema);

export default NewCampaign;
