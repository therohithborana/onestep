import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index for userId, goalId, and date to ensure uniqueness
ProgressSchema.index({ userId: 1, goalId: 1, date: 1 }, { unique: true });

// Prevent overwrite model error when hot reloading in development
const Progress = mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);

export default Progress; 