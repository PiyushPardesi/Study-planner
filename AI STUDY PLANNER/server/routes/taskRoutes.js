import express from 'express';
import { 
  createTask, 
  updateTaskStatus, 
  getTasksByProject, 
  deleteTask, 
  getAllUserTasks 
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get all tasks for the user (Dashboard stats)
// This must come BEFORE /:projectId or it might get confused
router.get('/', protect, getAllUserTasks); 

// 2. Task Actions
router.post('/', protect, createTask);
router.get('/:projectId', protect, getTasksByProject);
router.put('/:id', protect, updateTaskStatus);
router.delete('/:id', protect, deleteTask);

export default router;