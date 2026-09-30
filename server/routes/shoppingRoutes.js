import express from 'express';
import {
  getShoppingItems,
  addShoppingItem,
  addBulkShoppingItems,
  toggleShoppingItem,
  deleteShoppingItem,
  clearCheckedItems,
} from '../controllers/shoppingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getShoppingItems)
  .post(addShoppingItem);

router.post('/bulk', addBulkShoppingItems);
router.delete('/clear/checked', clearCheckedItems);

router.route('/:id')
  .put(toggleShoppingItem)
  .delete(deleteShoppingItem);

export default router;
