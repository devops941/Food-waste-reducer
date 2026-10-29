import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import { analyzeDishImage, scanProductImage } from './services/visionService.js';

async function testVision() {
  console.log('--- Testing AI Vision Recognition ---');
  console.log('Gemini Model:', process.env.GEMINI_VISION_MODEL || 'gemini-3.5-flash');
  console.log('Gemini Key Configured:', Boolean(process.env.GEMINI_API_KEY));

  // 1x1 test pixel
  const samplePixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

  console.log('\n1. Testing analyzeDishImage...');
  const dishResult = await analyzeDishImage(samplePixel);
  console.log('Dish Name Identified:', dishResult?.dishName);
  console.log('Cuisine:', dishResult?.cuisine);
  console.log('Confidence:', dishResult?.confidence);
  console.log('Ingredients:', dishResult?.ingredients?.slice(0, 3));

  console.log('\n2. Testing scanProductImage...');
  const productResult = await scanProductImage(samplePixel);
  console.log('Product Name Identified:', productResult?.name);
  console.log('Category:', productResult?.category);
  console.log('Expiry Date:', productResult?.expiryDate);

  console.log('\nAI Vision test completed successfully!');
}

testVision().catch(console.error);
