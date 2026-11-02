import express from 'express';
import { signOut, signin } from '../controllers/auth.controller.js';

const router = express.Router();

// there is no public sign-up: the owner's account is created with `npm run create-admin`
router.post("/signin", signin);
router.get('/signout', signOut);

export default router;
