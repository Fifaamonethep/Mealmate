import express from 'express'
import { getMeals, getMealById, createMeal, deleteMeal } from '../controllers/mealsController.js'
import { authenticateToken, requireGroupMember } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateToken, getMeals)
router.get('/:id', authenticateToken, requireGroupMember, getMealById)
router.post('/', authenticateToken, requireGroupMember, createMeal)
router.delete('/:id', authenticateToken, requireGroupMember, deleteMeal)

export default router

