import * as config from '../config.js';
import jwt from 'jsonwebtoken';
import { emailTemplate } from '../helpers/email.js';
import { hashPassword, comparePassword} from '../helpers/auth.js';
import User from '../models/user.js';
import { nanoid } from 'nanoid';
import validator  from 'email-validator';
import e from 'express';

const userToken = (req,res,user,message) => {
    const logintoken = jwt.sign({ _id: user._id }, config.JWT_SECRET, { expiresIn: '1h',});
    const refreshToken = jwt.sign({ _id: user._id }, config.JWT_SECRET, { expiresIn: '7d',});
    user.password = undefined;
    user.resetCode = undefined;
    
    return res.json({
        logintoken,
        refreshToken,
        user,
        message
    });
};

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
        return res.json({error: "Pre-Registration went wrong"});
    }
};

export const register = async (req, res) => {
    try{
        const { token } = req.body;
        const { email, password } = jwt.verify(token, config.JWT_SECRET);
        const userExist = await User.findOne({ email });
        if(userExist){
            return res.json({error: "Email is already registered"});
        }
        const hashedPassword = await hashPassword(password);
        const user = await new User({
            email,
            password: hashedPassword,
            username: nanoid(6)
        }).save()
        userToken(req,res,user,"Registration Success");
    }catch(err){
        console.log(err);
        return res.json({error: "Registration went wrong"});
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
        userToken(req,res,user,"Login Success");
    }catch(err){    
        console.log(err);
        return res.json({error: "Login went wrong"});
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
        return res.json({error: "Forgot Password went wrong"});
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
        userToken(req,res,user,"Password Reset");
    }catch(err){
        console.log(err);
        return res.json({error: "Reset Password went wrong"});
    }
};


export const refreshToken = async (req, res) => {
    try{
        console.log(req.headers);
        const { _id} = jwt.verify(req.headers.refreshtoken, config.JWT_SECRET);
        const user = await User.findById(_id);
        userToken(req,res,user,"Token Refreshed");
    }catch(error){
        console.log(error);
        return res.status(401).json({message: "Refresh Token Generation Failed"});
    }
};

export const currentUser = async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        user.password = undefined;
        user.resetCode = undefined;
        return res.json(user);
    }catch(error){
        return res.status(401).json({message: "Authorization required"});
    }
};

export const publicProfile = async (req, res) => {
    try{
        const user = await User.findOne({ username: req.params.username });
        user.password = undefined;
        user.resetCode = undefined;
        return res.json(user);
    }catch(error){
        console.log(error);
        return res.status(401).json({message: "Failed to fetch public profile"});
    }
};


export const updatePassword = async (req, res) => {
    try{
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        const match = await comparePassword(oldPassword, user.password);
        if(!match){
            return res.json({error: "Invalid Password"});
        }
        if(newPassword.length < 6){
            return res.json({error: "Password must be atleast 6 characters long"});
        }
        user.password = await hashPassword(newPassword);
        user.save();
        return res.json({message: "Password Updated"});
    }catch(error){
        console.log(error);
        return res.status(401).json({message: "Failed to update password"});
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, req.body, {
            new: true,
        });
        user.password = undefined;
        user.resetCode = undefined;
        return res.json(user); // Added return here
    } catch (error) {
        console.log(error);
        if (error.codeName === "DuplicateKey") {
            return res.json({ error: "Username or email is already taken" }); // Return to ensure no further execution
        } else {
            return res.status(403).json({ error: "Unauthorized" }); // Return for consistency
        }
    }
  };
  