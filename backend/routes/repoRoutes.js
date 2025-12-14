import express from 'express';
import Joi from 'joi';
import { evaluateRepo } from '../services/repoService.js';

const router = express.Router();

// Validation schema
const repoSchema = Joi.object({
  url: Joi.string().uri().pattern(/github\.com\/[^\/]+\/[^\/]+/).required()
    .messages({
      'string.pattern.base': 'Please provide a valid GitHub repository URL'
    })
});

// Evaluate repository
router.post('/evaluate', async (req, res) => {
  try {
    const { error } = repoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await evaluateRepo(req.body.url);
    res.json(result);
  } catch (err) {
    console.error('Evaluation error:', err.message);
    
    if (err.status === 404 || err.message?.includes('Not Found')) {
      return res.status(404).json({ error: 'Repository not found. Please check the URL and ensure the repository is public.' });
    }
    if (err.message?.includes('rate limit')) {
      return res.status(429).json({ error: 'GitHub API rate limit exceeded. Please try again later.' });
    }
    
    res.status(500).json({ error: 'Failed to evaluate repository. Please try again.' });
  }
});

export default router;