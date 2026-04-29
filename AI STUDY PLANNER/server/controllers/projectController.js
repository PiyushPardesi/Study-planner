import Project from '../models/Project.js';
import Task from '../models/Task.js';

/**
 * @desc    Get all projects for the logged-in user
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id });
    res.json(projects);
  } catch (error) {
    console.error("Fetch Projects Error:", error.message);
    res.status(500).json({ message: 'Server Error: Could not fetch projects' });
  }
};

/**
 * @desc    Get a single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project || project.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error("Get Project By ID Error:", error.message);
    res.status(500).json({ message: 'Server Error: Could not retrieve project' });
  }
};

/**
 * @desc    Create a new project (with AI task integration)
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req, res) => {
  try {
    const { title, description, deadline, tags, priority, tasks } = req.body;

    // 1. Create the Project first
    const project = await Project.create({
      user: req.user._id,
      title,
      description,
      deadline,
      tags,
      priority
    });

    // 2. Convert AI suggested roadmap into real, interactive Task documents
    if (tasks && tasks.length > 0) {
      const taskPromises = tasks.map(taskText => 
        Task.create({
          project: project._id, 
          user: req.user._id,    
          title: taskText,       
          priority: 'Medium',    
          isCompleted: false
        })
      );
      
      await Promise.all(taskPromises);
    }

    res.status(201).json(project);
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Update an existing project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project || project.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;
    project.deadline = req.body.deadline || project.deadline;
    project.priority = req.body.priority || project.priority;
    
    if (req.body.tags) {
      project.tags = req.body.tags;
    }

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    console.error("Update Project Error:", error.message);
    res.status(500).json({ message: 'Server Error: Could not update project' });
  }
};

/**
 * @desc    Delete a project and its cascading tasks
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this project' });
    }

    // Cascading Delete: Remove all tasks linked to this project ID
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: 'Project and all associated tasks have been removed' });
  } catch (error) {
    console.error("Delete Project Error:", error.message);
    res.status(500).json({ message: 'Server Error: Could not delete project' });
  }
};