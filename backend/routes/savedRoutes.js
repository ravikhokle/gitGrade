import express from 'express';
import jwt from 'jsonwebtoken';
import SavedResult from '../models/SavedResult.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gitgrade_secret_key';

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Login required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Save result
router.post('/', auth, async (req, res) => {
  try {
    const { repoUrl, score, skillLevel, summary, roadmap } = req.body;
    
    // Check if already saved
    const exists = await SavedResult.findOne({ userId: req.user.id, repoUrl });
    if (exists) {
      exists.score = score;
      exists.skillLevel = skillLevel;
      exists.summary = summary;
      exists.roadmap = roadmap;
      exists.savedAt = new Date();
      await exists.save();
      return res.json(exists);
    }
    
    const saved = new SavedResult({
      userId: req.user.id,
      repoUrl,
      score,
      skillLevel,
      summary,
      roadmap
    });
    await saved.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save' });
  }
});

// Get saved results
router.get('/', auth, async (req, res) => {
  try {
    const results = await SavedResult.find({ userId: req.user.id }).sort({ savedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// Delete saved result
router.delete('/:id', auth, async (req, res) => {
  try {
    await SavedResult.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;