import e from 'express';
import { model,Schema, ObjectId } from 'mongoose';

const authSchema = new Schema({
    username: {
        type: String,
        trim: true,
        required: true,
        min: 3,
        max: 20,
        unique: true,
        lowercase: true,
    },
    name: {
        type: String,
        trim: true,
        default: "",
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
    },
    passsword: {
        type: String,
        required: true,
        maxLength: 256,
    },
    address: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: "",
    },
    company: {
        type: String,
        default: "",
    },
    photo : {},
    role: {
        type: [String],
        default: ["Buyer"],
        enum: ["Buyer","Seller","Admin"],
    },
    enquiredProperties: [{type: ObjectId, ref: 'Property'}],
    wishlist: [{type: ObjectId, ref: 'Property'}],
    resetCode: "",
},{timestamps: true});

export default model('User',authSchema);