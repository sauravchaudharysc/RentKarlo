import express from 'express';
import *  as auth from '../controllers/auth.js';
import {requireSignin}  from '../middlewares/auth.js';

// To Implement Routing System
const router = express.Router();

router.get('/',requireSignin,auth.welcome);
router.post('/pre-register',auth.preRegister);
router.post('/register',auth.register);
router.post('/login',auth.login);
router.post('/forgot-password',auth.forgotPassword);
router.post('/reset-password',auth.resetPassword);
router.get('/refresh-token',auth.refreshToken);
router.get('/current-user',requireSignin,auth.currentUser);
router.get('/profile/:username',auth.publicProfile);
router.put('/update-password',requireSignin,auth.updatePassword);
router.put('/update-profile',requireSignin,auth.updateProfile);

export default router;