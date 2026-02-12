import express from "express";
import { Campaign } from "../models/campaignmodel.js";
import sharp from "sharp";

export const campaign = express.Router();



// ✅ Get all published campaigns (Public - User)
campaign.get("/", async (req, res) => {
  try {
    const data = await Campaign.find({ Status: "Active" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});


// ✅ Get single campaign by ID (Public)
campaign.get("/:id", async (req, res) => {
  try {
    const data = await Campaign.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ msg: "Campaign not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

campaign.get("/image/:title", async (req, res) => {
  try {
    const { title } = req.params;

    const data = await Campaign.findOne({ Title: title });

    if (!data || !data.Image) {
      return res.status(404).json({ msg: "Image not found" });
    }

    const imageBuffer = Buffer.from(data.Image, "base64");

    const compressedImage = await sharp(imageBuffer)
      .resize({ width: 400 })
      .jpeg({ quality: 70 })
      .toBuffer();

    res.set("Content-Type", "image/jpeg");
    res.send(compressedImage);

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

campaign.get("/campaign/:title", async (req, res) => {
  try {
    const { title } = req.params;

    const data = await Campaign.findOne({ Title: title });

    if (!data) {
      return res.status(404).json({ msg: "Campaign not found" });
    }

    res.status(200).json({
      Title: data.Title,
      Category: data.Category,
      Goal: data.Goal,
      Raised: data.Raised,
      Status: data.Status,
      Description: data.Description,
      ImageUrl: `http://localhost:2000/campaign/image/${encodeURIComponent(data.Title)}`
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});
