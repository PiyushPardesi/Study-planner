import express from 'express';
import { getAiTasks } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only logged-in users can use the AI features
router.post('/breakdown', protect, getAiTasks);

export default router;