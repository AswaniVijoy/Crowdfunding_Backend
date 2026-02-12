import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/usermodel.js";
import { Donation } from "../models/donationmodel.js";
import { Campaign } from "../models/campaignmodel.js";
import { authenticate } from "../middleware/auth.js";

export const user = express.Router();

// =============================
// SIGNUP
// =============================
user.post("/signup", async (req, res) => {
    try {
        const { UserName, Email, Password, UserRole, AdminSecret } = req.body;

        if (!UserName || !Email || !Password) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        const existingUser = await User.findOne({ Email });
        if (existingUser) {
            return res.status(400).json({ msg: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        let role = "User"; 
        if (UserRole && UserRole.toLowerCase() === "admin") {
            if (AdminSecret === process.env.ADMIN_SECRET) {
                role = "Admin";
            } else {
                return res.status(403).json({ msg: "Invalid admin secret" });
            }
        }

        const newUser = await User.create({
            UserName,
            Email,
            Password: hashedPassword,
            UserRole: role,
        });

        res.status(201).json({ msg: "Signup successful", user: { name: newUser.UserName, role: newUser.UserRole } });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

// =============================
// LOGIN (Fixed Crash)
// =============================
user.post('/login', async (req, res) => {
    try {
        const { UserName, Password } = req.body;

        // Find user by UserName
        const result = await User.findOne({ UserName });

        // FIX: Check if user exists BEFORE accessing result.Password
        if (!result) {
            console.log(`Login attempt failed: User "${UserName}" not found.`);
            return res.status(404).json({ msg: 'UserName not registered' });
        }

        // Now it's safe to use 'result'
        const valid = await bcrypt.compare(Password, result.Password);
        if (!valid) {
            return res.status(401).json({ msg: 'Invalid Password' });
        }

        const token = jwt.sign(
            { UserName: result.UserName, UserRole: result.UserRole },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('authToken', token, { httpOnly: true });
        res.status(200).json({ msg: 'Successfully logged in', role: result.UserRole });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ msg: 'Something went wrong' });
    }
});

// =============================
// DONATE
// =============================
user.post("/donate", authenticate, async (req, res) => {
  try {
    const { CampaignTitle, Amount } = req.body;

    if (!CampaignTitle || !Amount) {
      return res.status(400).json({ msg: "CampaignTitle and Amount required" });
    }

    if (Amount <= 0) {
      return res.status(400).json({ msg: "Amount must be greater than 0" });
    }

    // Prevent Admin from donating
    if (req.role === "Admin") {
      return res.status(403).json({ msg: "Admins are not allowed to donate" });
    }

    // Find the campaign
    const campaignData = await Campaign.findOne({ Title: CampaignTitle });
    if (!campaignData) {
      return res.status(404).json({ msg: "Campaign not found" });
    }

    // Calculate potential new raised amount
    const newRaised = campaignData.Raised + Number(Amount);

    if (newRaised > campaignData.Goal) {
      const remaining = campaignData.Goal - campaignData.Raised;
      return res.status(400).json({
        msg: `Donation exceeds campaign goal. Only ${remaining} is needed to reach the goal.`,
      });
    }

    // Create donation
    await Donation.create({
      Donar: req.name,
      CampaignTitle,
      Amount: Number(Amount),
    });

    // Update campaign raised amount
    const updatedCampaign = await Campaign.findOneAndUpdate(
      { Title: CampaignTitle },
      { $inc: { Raised: Number(Amount) } },
      { new: true }
    );

    // Check if goal achieved
    if (updatedCampaign.Raised === updatedCampaign.Goal) {
      return res.status(201).json({
        msg: "Donation successful! 🎉 Campaign goal fully achieved!",
        Raised: updatedCampaign.Raised,
        Goal: updatedCampaign.Goal,
      });
    }

    res.status(201).json({
      msg: "Donation successful",
      Raised: updatedCampaign.Raised,
      Goal: updatedCampaign.Goal,
      Remaining: updatedCampaign.Goal - updatedCampaign.Raised,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});



// =============================
// GET MY DONATIONS
// =============================
user.get("/my", authenticate, async (req, res) => {
    try {
        const data = await Donation.find({ Donar: req.name });
        res.json(data);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

export default user;