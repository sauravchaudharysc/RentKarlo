import express from 'express';
import *  as auth from '../controllers/auth.js';

// To Implement Routing System
const router = express.Router();

router.get('/',auth.welcome);
router.post('/pre-register',auth.preRegister);
router.post('/register',auth.register);
router.post('/login',auth.login);
router.post('/forgot-password',auth.forgotPassword);
router.post('/reset-password',auth.resetPassword);

export default router;