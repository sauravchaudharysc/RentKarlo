import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../config.js";   

export const requireSignin = (req, res, next) => { 
    try{
        const decoded = jwt.verify(req.headers.authorization, JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        return res.status(401).json({message: "Authorization required"});
    }
}