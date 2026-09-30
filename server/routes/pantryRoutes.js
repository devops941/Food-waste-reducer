import express from 'express';
import {
  getPantryItems,
  getPantryItemById,
  addPantryItem,
  updatePantryItem,
  deletePantryItem,
  markItemAsUsed,
  markItemAsWasted,
} from '../controllers/pantryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPantryItems)
  .post(addPantryItem);

router.route('/:id')
  .get(getPantryItemById)
  .put(updatePantryItem)
  .delete(deletePantryItem);

router.post('/:id/use', markItemAsUsed);
router.post('/:id/waste', markItemAsWasted);

export default router;
