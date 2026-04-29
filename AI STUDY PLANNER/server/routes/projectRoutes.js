import express from 'express';
import { getProjects, createProject, deleteProject, getProjectById, updateProject } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProjectById)   // <-- NEW
  .put(protect, updateProject)    // <-- NEW
  .delete(protect, deleteProject);

export default router;