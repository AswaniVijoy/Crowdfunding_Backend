import express,{json} from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import { user } from './routes/userroute.js';
import { admin } from './routes/adminroute.js';
import { authenticate } from './middleware/auth.js';
import admincheck from './middleware/admin.js';
import campaign from './routes/campaignroute.js';
dotenv.config();

const app=express();
app.use(json())
app.use("/user",user);
app.use("/",campaign)
app.use("/admin",authenticate,admincheck,admin);


const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crowdfundingdb';

mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB!'))
    .catch(err => console.error('Could not connect to MongoDB...', err));


const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
    
})