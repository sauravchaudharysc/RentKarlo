import * as config from '../config.js';
import jwt from 'jsonwebtoken';
import { emailTemplate } from '../helpers/email.js';
import { hashPassword, comparePassword} from '../helpers/auth.js';
import User from '../models/user.js';
import { nanoid } from 'nanoid';
import validator  from 'email-validator';
import e from 'express';

export const welcome = (req, res) => {
    res.json({
        message: 'Chalo Aab Sab Rent Karo'
    });
};

export const preRegister = async (req, res) => {
    try{
        /*
            On Pre-Registration, we will send an email to the user with a link to complete the registration.
            The link will contain a token that will be used to verify the user.
            The link will land them to a page where email and password will be extracted from the token and then user will be registered.
        */

        const { email, password } = req.body;

        // Email and Password Checks
        if(!validator.validate(email)){
            return res.json({error: "Invalid Email"});
        }

        if(password.length < 6){
            return res.json({error: "Password must be atleast 6 characters long"});
        }

        const user = await User.findOne({ email });
        if(user){
            return res.json({error: "Email is already registered"});
        }

        const token = jwt.sign({ email, password }, config.JWT_SECRET, { expiresIn: '1h' });

        config.SES_CLIENT.sendEmail(
            emailTemplate(
                email,
                'Account Registration',
                `
                    <p>Click on the link below to complete registration</p>
                    <a href="${config.CLIENT_URL}/auth/register/${token}">Register Now</a>
                `,
                config.REPLY_TO
        ), (err, data) => {
            if(err){
                return res.json({error: "Something went wrong"});
            }else{
                console.log(data);
                return res.json({message: "Email Sent"});
            }
        });
    }catch(err){
        console.log(err);
        return res.json({error: "Something went wrong"});
    }
};

export const register = async (req, res) => {
    try{
        const { token } = req.body;
        const { email, password } = jwt.verify(token, config.JWT_SECRET);
        const hashedPassword = await hashPassword(password);
        const user = await new User({
            email,
            password: hashedPassword,
            username: nanoid(6)
        }).save();

        const logintoken = jwt.sign({ _id: user._id }, config.JWT_SECRET, { expiresIn: '1h' });

        const refreshToken = jwt.sign({ _id: user._id }, config.JWT_SECRET, { expiresIn: '7d' });
        
        console.log(email,password);
        // Save this user to the database
        return res.json({
            logintoken,
            refreshToken,
            user: {
                email,
                username: user.username,
                _id: user._id
            },
            message: "User Registered"});
    }catch(err){
        console.log(err);
        return res.json({error: "Something went wrong"});
    }
};

export const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        //1. Find the user with the email
        const user = await User.findOne({ email });
        if(!user){
            return res.json({error: "Invalid Credentials"});
        }

        //2. Compare the password
        const match = await comparePassword(password, user.password);
        if(!match){
            return res.json({error: "Invalid Credentials"});
        }

        const logintoken = jwt.sign({ _id: user._id }, config.JWT_SECRET, { expiresIn: '1h',});
        const refreshToken = jwt.sign({ _id: user._id }, config.JWT_SECRET, { expiresIn: '7d',});
        return res.json({
            logintoken,
            refreshToken,
            user: {
                email,
                username: user.username,
                _id: user._id
            },
            message: "User Logged In"
        });
    }catch(err){    
        console.log(err);
        return res.json({error: "Something went wrong"});
    }
};

// Forgot Password 
/*
If a user forgot password, we will send an email to the user with a link to reset the password.
User will click on the link and login and then can update the password.
*/

export const forgotPassword = async (req, res) => {
    try{
        const { email } = req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.json({error: "User not found"});
        }else{
            const resetCode = nanoid();
            user.resetCode = resetCode;
            user.save();
            const resettoken = jwt.sign({ resetCode }, config.JWT_SECRET, { expiresIn: '1h',});
            
            config.SES_CLIENT.sendEmail(emailTemplate(email,
                "Account Recovery",
                `
                <p>Click on the link below to reset your password</p>
                <a href="${config.CLIENT_URL}/auth/reset-password/${resettoken}">Reset Password</a>
                `,
                config.REPLY_TO
            ), (err, data) => {
                if(err){
                    return res.json({error: "Something went wrong"});
                }else{
                    console.log(data);
                    return res.json({message: "Email Sent"});
                }
            });
        }
    }catch(err){    
        console.log(err);
        return res.json({error: "Something went wrong"});
    }
};

export const resetPassword = async (req, res) => {
    try{
        const resettoken = req.body.resetCode;
        const { resetCode } = jwt.verify(resettoken, config.JWT_SECRET);
        const user = await User.findOneAndUpdate({ resetCode }, { resetCode: '' });
        if(!user){
            return res.json({error: "Invalid Token"});
        }
        const logintoken = jwt.sign({ _id: user._id }, config.JWT_SECRET, { expiresIn: '1h',});
        const refreshToken = jwt.sign({ _id: user._id }, config.JWT_SECRET, { expiresIn: '7d',});
        return res.json({
            logintoken,
            refreshToken,
            user: {
                username: user.username,
                _id: user._id
            },
            message: "User Logged In"
        });
    }catch(err){
        console.log(err);
        return res.json({error: "Something went wrong"});
    }
};