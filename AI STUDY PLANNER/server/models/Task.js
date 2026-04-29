import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  dueDate: { type: Date },
  // ADD THIS LINE:
  completedAt: { type: Date } 
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);