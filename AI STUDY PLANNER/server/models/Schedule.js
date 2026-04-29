import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  category: { 
    type: String, 
    enum: ['Work', 'Personal', 'Study', 'Health'], 
    default: 'Work' 
  },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema);