import { Router } from "express";
import NewCampaign from "../models/newcampaignmodel.js";
import Campaign from "../models/campaignmodel.js";
import Donation from "../models/donationmodel.js";
import { authenticate } from "../middleware/auth.js";
import sharp from "sharp";

const campaign=Router();



campaign.get('/getCourseImage', async (req, res) => {
    try {
        const { CampaignTitle } = req.query;

        if (!CampaignTitle) {
            return res.status(400).json({
                msg: "Campaign query parameter required"
            });
        }

        const result = await NewCampaign.findOne({ CampaignTitle});
        if (!result) {
            return res.status(404).json({
                msg: "Campaign Not found"
            });
        }

        if (!result.CampaignImage) {
            return res.status(404).json({
                msg: "Image not found for this campaign"
            });
        }

        const imageBuffer = Buffer.from(result.CampaignImage, "base64");
        const compressedImage = await sharp(imageBuffer).resize({ width: 300 }).jpeg({ quality: 70 }).toBuffer();
        res.set({
            "Content-Type": "image/png",
        });

        res.send(compressedImage);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server error" })
    }
})



campaign.get('/campaign', async (req, res) => {
  try {
    const { CampaignTitle } = req.query;

    if (!CampaignTitle) {
      return res.status(400).json({
        msg: "CampaignTitle query parameter required"
      });
    }

    const campaign = await NewCampaign.findOne({ CampaignTitle });

    if (!campaign) {
      return res.status(404).json({
        msg: "Campaign not found"
      });
    }

    res.status(200).json({
      CampaignTitle: campaign.CampaignTitle,
      ShortDescription: campaign.ShortDescription,
      FullDescription: campaign.FullDescription,
      GoalAmount: campaign.GoalAmount,
      Category: campaign.Category,

      CampaignImageUrl: `http://localhost:2000/getCourseImage?CampaignTitle=${encodeURIComponent(campaign.CampaignTitle)}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
});

campaign.get('/my-donations', authenticate, async (req, res) => {
  try {
    const username = req.name; 

    const donations = await Donation.find({ Donar: username });

    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

campaign.post('/donate', async (req, res) => {
  try {

    const { Donar, Campaign: campaignTitle, Amount } = req.body;

    await Donation.create({
      Donar,
      Campaign: campaignTitle,
      Amount,
      Date: new Date()
    });

    await Campaign.updateOne(
      { Title: campaignTitle },
      { $inc: { Raised: Amount } }
    );

    res.status(201).json({ msg: "Donation successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

campaign.get('/campaign/:title', async (req, res) => {
  try {
    const { title } = req.params;

    const campaign = await Campaign.findOne({ Title: title });
    if (!campaign) {
      return res.status(404).json({ msg: "Campaign not found" });
    }

    res.status(200).json(campaign);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

campaign.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ Status: "Active" });
    res.status(200).json(campaigns);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

campaign.get('/campaigns/category/:category', async (req, res) => {
  const { category } = req.params;
  const campaigns = await Campaign.find({ Category: category });
  res.json(campaigns);
});


export default campaign;