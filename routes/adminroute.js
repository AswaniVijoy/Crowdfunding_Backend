import { Router } from "express";
import Donation from "../models/donationmodel.js";
import Campaign from "../models/campaignmodel.js";
import NewCampaign from "../models/newcampaignmodel.js";
import upload from "../middleware/upload.js";
const admin=Router();


admin.post('/campaign', async (req, res) => {
  try {
    const {Title,Category,Goal,Raised,Status}=req.body

   
    if (await Campaign.findOne({ Title: Title })) {
      res.status(400).json({ msg: 'Campaign already exist' })
    }
    else {
      const Project = new Campaign({
      Title: Title,
      Category: Category,
      Goal: Number(Goal),
      Raised: Number(Raised),
      Status: Status
      });
      await Project.save();
      res.status(201).json({ msg: 'Campaign Added Successfully' })

    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Something went wrong' })
  }

})

// admin.post('/donation', async (req, res) => {
//   try {
//     const {Donar,Campaign,Amount,Date}=req.body

   
    
//       const  newDonation= new Donation({
//       Donar: Donar,
//       Campaign: Campaign,
//       Amount: Number(Amount),
//       Date: Date
//       });
//       await newDonation.save();
//       res.status(201).json({ msg: 'New Donation Found' })

    
//   }
//   catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: 'Something went wrong' })
//   }

// })

admin.post('/newcampaign', upload.single('CampaignImage'), async (req, res) => {
  try {
    const {  CampaignTitle,
    ShortDescription,
    FullDescription,
    GoalAmount,
    Category,
    CampaignImage } = req.body;
    if (await NewCampaign.findOne({ CampaignTitle })) {
      res.status(400).json({ msg: 'Campaign already exist' })
    }
    else {
      let imageBase64 = null;
      if (req.file) {
        imageBase64 = req.file.buffer.toString('base64');
      }
      const newCourse = new NewCampaign({
        CampaignTitle: CampaignTitle,
        ShortDescription: ShortDescription,
        FullDescription: FullDescription,
        Category:Category,
        GoalAmount: Number(GoalAmount),
        CampaignImage: imageBase64
      });
      await newCourse.save();
      res.status(201).json({ msg: 'Course successfully entered' })

    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Something went wrong' })
  }

})


admin.get('/donations', async (req, res) => {
  try {
    const { UserName } = req.query;

    if (!UserName) {
      return res.status(400).json({
        msg: "UserName query parameter required"
      });
    }

    const donations = await Donation.find({ Donar: UserName });

    if (donations.length === 0) {
      return res.status(404).json({
        msg: "No donations found for this user"
      });
    }

    res.status(200).json({
      UserName: UserName,
      TotalDonations: donations.length,
      Donations: donations
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
});


admin.delete('/delete', async (req, res) => {
  try {
    const {Title } = req.query;

    if (!Title) {
      return res.status(400).json({
        msg: "CampaignTitle query parameter required"
      });
    }

    const campaign = await Campaign.findOne({ Title });

    if (!campaign) {
      return res.status(404).json({
        msg: "Campaign not found"
      });
    }

    await Campaign.deleteOne({ Title });

    res.status(200).json({
      msg: "Campaign deleted successfully",
      Title: Title
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
});
     
admin.put('/updatecampaign', async (req, res) => {
  try {
    const { Title, Category, Goal, Raised, Status } = req.body;

    if (!Title) {
      return res.status(400).json({
        msg: "Title is required"
      });
    }

    const updatedCampaign = await Campaign.findOneAndUpdate(
      { Title },
      {
        Category,
        Goal: Number(Goal),
        Raised: Number(Raised),
        Status
      },
      { new: true }
    );

    if (!updatedCampaign) {
      return res.status(404).json({
        msg: "Campaign not found"
      });
    }

    res.status(200).json({
      msg: "Campaign updated successfully",
      Campaign: updatedCampaign
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
});

admin.get('/dashboard', async (req, res) => {
  try {
    const campaignCount = await Campaign.countDocuments();
    const donationCount = await Donation.countDocuments();
    const totalRaised = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: "$Amount" } } }
    ]);

    res.status(200).json({
      Campaigns: campaignCount,
      Donations: donationCount,
      TotalRaised: totalRaised[0]?.total || 0
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

admin.get("/admincampaign", async (req, res) => {
    try {
        const allCampaign = await Campaign.find();
        res.status(200).json(allCampaign);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server error" })
    }
})

export {admin}






