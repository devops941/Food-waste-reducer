import { analyzeDishImage, scanProductImage } from '../services/visionService.js';

/**
 * @desc    Analyze a cooked dish image and return what the dish is, how to prepare it, ingredients, and storage tips
 * @route   POST /api/ai/analyze-dish
 * @access  Private / Public
 */
export const analyzeDish = async (req, res, next) => {
  try {
    const imageBase64 = req.body.imageBase64 || req.body.image;
    const dishNameHint = req.body.dishNameHint || req.body.dishName;

    if (!imageBase64 && !dishNameHint) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an imageBase64 string or dishNameHint.',
      });
    }

    const analysis = await analyzeDishImage(imageBase64, dishNameHint);

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    console.error('[AI Vision Controller - Dish Analysis Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze dish. Please try another image.',
      error: err.message,
    });
  }
};

/**
 * @desc    Scan a grocery product image, detect product name, category, and OCR expiry date
 * @route   POST /api/ai/scan-product
 * @access  Private / Public
 */
export const scanProduct = async (req, res, next) => {
  try {
    const imageBase64 = req.body.imageBase64 || req.body.image;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an imageBase64 string of the product/label.',
      });
    }

    const scanResult = await scanProductImage(imageBase64);

    return res.status(200).json({
      success: true,
      data: scanResult,
    });
  } catch (err) {
    console.error('[AI Vision Controller - Product Scan Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to scan product. Please verify image clarity.',
      error: err.message,
    });
  }
};
