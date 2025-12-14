import mongoose from 'mongoose';

const savedResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repoUrl: { type: String, required: true },
  score: { type: Number, required: true },
  skillLevel: { type: String, required: true },
  summary: { type: String, required: true },
  roadmap: { type: String, required: true },
  savedAt: { type: Date, default: Date.now }
});

export default mongoose.model('SavedResult', savedResultSchema);