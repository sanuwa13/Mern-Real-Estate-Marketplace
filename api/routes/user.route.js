import express from 'express';
import { test, updateUser } from '../controllers/user.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';
import { getUserListings } from '../controllers/user.controller.js';
import { getUser } from '../controllers/user.controller.js';


const router = express.Router();

router.get('/test', test);
router.post('/update/:id', verifyAdmin, updateUser);
router.get('/listings/:id', verifyAdmin, getUserListings);
router.get('/:id', verifyAdmin, getUser);


export default router;
