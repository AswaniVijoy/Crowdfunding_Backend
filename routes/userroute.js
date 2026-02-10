import { Router } from "express";
import User from "../models/usermodel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const user=Router();



user.post('/signup', async (req, res) => {

    
    try {
        const { UserName,Email, Password, UserRole } = req.body
        console.log(UserName);

        const newPassword = await bcrypt.hash(Password, 10)
        console.log(newPassword);
        const result = await User.findOne({ UserName: UserName })
        console.log(result);

        if (result) {
            res.status(400).json({ msg: 'Username already exist' })
        }
        else {
            const newUser = new User({
                UserName: UserName,
                Password: newPassword,
                Email:Email,
                UserRole: UserRole
            });
            await newUser.save();
            res.status(201).send('Successfully created');
        }

    }
    catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong')
    }
})


user.post('/login', async (req, res) => {
    try {
        const { UserName, Password } = req.body;
    


        const result = await User.findOne({ UserName });
            console.log("REQ BODY:", req.body);
            console.log("REQ Password:", Password);
            console.log("DB User:", result);
            console.log("DB Password:", result.Password);
        if (!result) {
            return res.status(404).json({ msg: 'UserName not registered' });
        }

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
        res.status(200).json({ msg: 'Successfully logged in' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Something went wrong' });
    }
});

user.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.status(200).json({ msg: "Logged out successfully" });
});


export {user}
