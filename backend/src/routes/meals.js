import express from 'express'
import { getMeals, getMealById, createMeal, deleteMeal } from '../controllers/mealsController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateToken, getMeals)
router.get('/:id', authenticateToken, getMealById)
router.post('/', authenticateToken, createMeal)
router.delete('/:id', authenticateToken, deleteMeal)

export default router
