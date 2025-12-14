import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  repoUrl: { type: String, required: true, unique: true },
  score: { type: Number, required: true },
  skillLevel: { type: String, required: true },
  summary: { type: String, required: true },
  roadmap: { type: String, required: true },
  metrics: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Evaluation', evaluationSchema);