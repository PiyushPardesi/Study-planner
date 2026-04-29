import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateTaskBreakdown = async (projectTitle, description, tags) => {
  try {
    // We'll use 'gemini-1.5-flash' because it's faster and smarter for task breakdowns
// Replace your existing line with this one:
// This alias always points to the best available Flash model in 2026
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
  Role: Senior AI Research Advisor (M.Tech CSE Specialization).
  Task: Generate a technical research roadmap for a graduate project.
  
  Project: ${projectTitle}
  Focus: ${description}
  Stack: ${tags ? tags.join(', ') : 'AI/ML, Python'}

  Instructions:
  1. Generate 5-7 specific technical milestones.
  2. Include advanced steps: "Dataset augmentation with MediaPipe," "Feature extraction using CNN-LSTM," "Hyperparameter tuning for Real-time inference," and "Model quantization for edge deployment."
  3. Return ONLY a valid JSON array of strings.
  Example: ["Pre-process video frames", "Extract 3D keypoints", "Train Transformer model"]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the AI's string response into a real JS array
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return ["Review project requirements", "Set up study environment", "Begin initial research"];
  }
};