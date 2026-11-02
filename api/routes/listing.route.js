import express from 'express';
import { createListing } from '../controllers/listing.controller.js';
import { verifyAdmin } from '../utils/verifyUser.js';
import { deleteListing, updateListing, getListing, getListings} from '../controllers/listing.controller.js';

const router = express.Router();


router.post('/create', verifyAdmin, createListing);
router.delete('/delete/:id', verifyAdmin, deleteListing);
router.post('/update/:id', verifyAdmin, updateListing);
router.get('/get/:id', getListing);
router.get('/get', getListings);

export default router;
