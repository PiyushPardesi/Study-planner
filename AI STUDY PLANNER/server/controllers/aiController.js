import { generateTaskBreakdown } from '../services/aiService.js';

export const getAiTasks = async (req, res) => {
  const { title, description, tags } = req.body;

  // Basic validation to ensure we have a title
  if (!title) {
    return res.status(400).json({ message: "Project title is required for AI analysis." });
  }

  try {
    // Call the service we just created
    const tasks = await generateTaskBreakdown(title, description, tags || []);
    
    // Return the array of tasks to the frontend
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ message: "AI failed to generate tasks." });
  }
};