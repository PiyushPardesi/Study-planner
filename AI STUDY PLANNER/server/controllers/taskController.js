import Task from '../models/Task.js';

// @desc    Add a task to a project
export const createTask = async (req, res) => {
  try {
    const { project, title, dueDate, priority } = req.body;
    const task = await Task.create({
      project,
      user: req.user._id,
      title,
      dueDate,
      priority
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status (toggle complete + timestamp)
export const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Toggle the status
    task.isCompleted = !task.isCompleted;

    // ✨ TIMESTAMP LOGIC: Save the date when completed, clear it if unchecked
    if (task.isCompleted) {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for a specific project
export const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      project: req.params.projectId,
      user: req.user._id 
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for the user (Dashboard stats)
export const getAllUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};