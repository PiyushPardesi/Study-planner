import express from 'express';
import { 
  createSchedule, 
  getMySchedules, 
  updateSchedule, 
  deleteSchedule 
} from '../controllers/scheduleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: /api/schedules
router.route('/')
  .get(protect, getMySchedules)   // Fetch all user schedules
  .post(protect, createSchedule); // Create a new schedule

// Route: /api/schedules/:id
router.route('/:id')
  .put(protect, updateSchedule)    // Update an existing schedule (title, description, times)
  .delete(protect, deleteSchedule); // Remove a schedule

export default router;