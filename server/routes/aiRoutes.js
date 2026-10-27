import express from 'express';
import { analyzeDish, scanProduct } from '../controllers/aiVisionController.js';

const router = express.Router();

// Route for dish verification and preparation recipe
router.post('/analyze-dish', analyzeDish);

// Route for product package & expiry date scanner
router.post('/scan-product', scanProduct);

export default router;
