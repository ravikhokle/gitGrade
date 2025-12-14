import { Octokit } from '@octokit/rest';
import simpleGit from 'simple-git';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Evaluation from '../models/Evaluation.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN }); // optional, for higher rate limit
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function evaluateRepo(url) {
  // Parse URL - strip .git suffix if present
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error('Invalid GitHub URL');
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '').replace(/\/$/, '');

  // Normalize URL for caching
  const normalizedUrl = `https://github.com/${owner}/${repo}`;

  // Check cache
  const existing = await Evaluation.findOne({ repoUrl: normalizedUrl });
  if (existing) return existing;

  // Fetch repo data from GitHub API
  const repoData = await octokit.repos.get({ owner, repo });
  const languages = await octokit.repos.listLanguages({ owner, repo });
  const commits = await octokit.repos.listCommits({ owner, repo, per_page: 100 });
  
  let contributors = [];
  try {
    const contribResponse = await octokit.repos.listContributors({ owner, repo });
    contributors = contribResponse.data;
  } catch (e) {
    // Some repos may not have contributors accessible
    contributors = [];
  }

  // Clone repo for analysis
  const tempDir = path.join(os.tmpdir(), `gitgrade-${Date.now()}`);
  await simpleGit().clone(`https://github.com/${owner}/${repo}.git`, tempDir);

  // Analyze
  const metrics = await analyzeRepo(tempDir, repoData.data, commits.data);

  // Compute score
  const score = computeScore(metrics, repoData.data, languages.data, commits.data, contributors);

  // Use Gemini for summary and roadmap
  const { summary, roadmap } = await generateInsights(metrics, score, repoData.data);

  // Save to DB
  const evaluation = new Evaluation({
    repoUrl: normalizedUrl,
    score: Math.round(score),
    skillLevel: getSkillLevel(score),
    summary,
    roadmap,
    metrics
  });
  await evaluation.save();

  // Cleanup
  await fs.rm(tempDir, { recursive: true, force: true });

  return evaluation;
}

async function analyzeRepo(dir, repoData, commits) {
  const metrics = {
    fileCount: 0,
    folderCount: 0,
    folderDepth: 0,
    hasReadme: false,
    readmeQuality: 0,
    readmeLength: 0,
    hasTests: false,
    testFileCount: 0,
    hasGitignore: false,
    hasLicense: false,
    hasPackageJson: false,
    hasCICD: false,
    languages: [],
    commitCount: commits.length,
    commitFrequency: 'low',
    hasMultipleBranches: false,
    codeFiles: 0,
    configFiles: 0
  };

  const codeExtensions = ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.jsx', '.tsx', '.vue', '.rb', '.php'];
  const configExtensions = ['.json', '.yaml', '.yml', '.toml', '.xml', '.env'];

  async function walk(currentDir, depth = 0) {
    let files;
    try {
      files = await fs.readdir(currentDir);
    } catch {
      return;
    }
    
    metrics.folderDepth = Math.max(metrics.folderDepth, depth);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      let stat;
      try {
        stat = await fs.stat(filePath);
      } catch {
        continue;
      }
      
      if (stat.isDirectory()) {
        if (file !== '.git' && file !== 'node_modules' && file !== '__pycache__') {
          metrics.folderCount++;
          if (file === '.github' || file === '.circleci') metrics.hasCICD = true;
          if (file === 'test' || file === 'tests' || file === '__tests__' || file === 'spec') metrics.hasTests = true;
          await walk(filePath, depth + 1);
        }
      } else {
        metrics.fileCount++;
        const lower = file.toLowerCase();
        const ext = path.extname(file).toLowerCase();
        
        if (codeExtensions.includes(ext)) metrics.codeFiles++;
        if (configExtensions.includes(ext)) metrics.configFiles++;
        
        if (lower === 'readme.md' || lower === 'readme.txt' || lower === 'readme') {
          metrics.hasReadme = true;
          try {
            const content = await fs.readFile(filePath, 'utf8');
            metrics.readmeLength = content.length;
            // Quality: check for sections, code blocks, badges
            const hasSections = (content.match(/^#+\s/gm) || []).length >= 3;
            const hasCodeBlocks = content.includes('```');
            const hasBadges = content.includes('![') || content.includes('shields.io');
            const hasInstall = /install|setup|getting started/i.test(content);
            metrics.readmeQuality = (hasSections ? 2 : 0) + (hasCodeBlocks ? 1 : 0) + (hasBadges ? 1 : 0) + (hasInstall ? 1 : 0);
          } catch {
            metrics.readmeQuality = 1;
          }
        }
        
        if (lower.includes('test') || lower.includes('spec') || lower.includes('.test.') || lower.includes('.spec.')) {
          metrics.hasTests = true;
          metrics.testFileCount++;
        }
        
        if (lower === '.gitignore') metrics.hasGitignore = true;
        if (lower === 'license' || lower === 'license.md' || lower === 'license.txt') metrics.hasLicense = true;
        if (lower === 'package.json' || lower === 'requirements.txt' || lower === 'pom.xml' || lower === 'cargo.toml') metrics.hasPackageJson = true;
        if (lower === '.github' || lower.includes('workflow') || lower === 'jenkinsfile' || lower === '.travis.yml') metrics.hasCICD = true;
      }
    }
  }

  await walk(dir);
  
  // Commit frequency analysis
  if (commits.length > 0) {
    const dates = commits.map(c => new Date(c.commit.author.date));
    const oldest = Math.min(...dates);
    const newest = Math.max(...dates);
    const daySpan = (newest - oldest) / (1000 * 60 * 60 * 24) || 1;
    const commitsPerDay = commits.length / daySpan;
    metrics.commitFrequency = commitsPerDay > 1 ? 'high' : commitsPerDay > 0.2 ? 'medium' : 'low';
  }
  
  return metrics;
}

function computeScore(metrics, repo, languages, commits, contributors) {
  let score = 0;
  const weights = {
    codeStructure: 20,
    documentation: 20,
    testing: 15,
    versionControl: 15,
    projectSetup: 15,
    community: 15
  };

  // Code Structure (20 points)
  let structureScore = 0;
  structureScore += Math.min(metrics.codeFiles / 5, 8); // up to 8 points for code files
  structureScore += metrics.folderCount >= 3 ? 6 : metrics.folderCount * 2; // up to 6 points for organization
  structureScore += metrics.folderDepth >= 2 && metrics.folderDepth <= 5 ? 6 : 3; // reasonable depth
  score += Math.min(structureScore, weights.codeStructure);

  // Documentation (20 points)
  let docScore = 0;
  if (metrics.hasReadme) {
    docScore += 8; // has readme
    docScore += Math.min(metrics.readmeQuality * 2, 8); // quality bonus
    docScore += metrics.readmeLength > 500 ? 4 : metrics.readmeLength > 200 ? 2 : 0;
  }
  score += Math.min(docScore, weights.documentation);

  // Testing (15 points)
  let testScore = 0;
  if (metrics.hasTests) {
    testScore += 8;
    testScore += Math.min(metrics.testFileCount * 2, 7);
  }
  score += Math.min(testScore, weights.testing);

  // Version Control (15 points)
  let vcScore = 0;
  vcScore += metrics.hasGitignore ? 5 : 0;
  vcScore += metrics.commitFrequency === 'high' ? 6 : metrics.commitFrequency === 'medium' ? 4 : 2;
  vcScore += commits.length > 20 ? 4 : commits.length > 5 ? 2 : 0;
  score += Math.min(vcScore, weights.versionControl);

  // Project Setup (15 points)
  let setupScore = 0;
  setupScore += metrics.hasPackageJson ? 5 : 0;
  setupScore += metrics.hasLicense ? 4 : 0;
  setupScore += metrics.hasCICD ? 6 : 0;
  score += Math.min(setupScore, weights.projectSetup);

  // Community/Popularity (15 points)
  let communityScore = 0;
  communityScore += Math.min(repo.stargazers_count / 10, 5);
  communityScore += Math.min(repo.forks_count / 5, 5);
  communityScore += contributors.length > 1 ? 5 : 2;
  score += Math.min(communityScore, weights.community);

  return Math.min(Math.round(score), 100);
}

function getSkillLevel(score) {
  if (score >= 80) return 'Expert';
  if (score >= 60) return 'Advanced';
  if (score >= 40) return 'Intermediate';
  if (score >= 20) return 'Beginner';
  return 'Novice';
}

async function generateInsights(metrics, score, repoData) {
  const prompt = `You are a senior developer mentor. Based on the following GitHub repository analysis, provide feedback.

Repository: ${repoData.name}
Description: ${repoData.description || 'No description'}
Score: ${score}/100

Metrics:
- Files: ${metrics.fileCount} total, ${metrics.codeFiles} code files
- Folders: ${metrics.folderCount} (depth: ${metrics.folderDepth})
- README: ${metrics.hasReadme ? `Yes (quality: ${metrics.readmeQuality}/5, length: ${metrics.readmeLength} chars)` : 'Missing'}
- Tests: ${metrics.hasTests ? `Yes (${metrics.testFileCount} test files)` : 'None detected'}
- License: ${metrics.hasLicense ? 'Yes' : 'No'}
- .gitignore: ${metrics.hasGitignore ? 'Yes' : 'No'}
- CI/CD: ${metrics.hasCICD ? 'Yes' : 'No'}
- Commit Frequency: ${metrics.commitFrequency}
- Total Commits: ${metrics.commitCount}

Respond in this exact JSON format:
{
  "summary": "A 2-3 sentence evaluation of the repository's strengths and weaknesses",
  "roadmap": "Step 1: [action]\\nStep 2: [action]\\nStep 3: [action]\\nStep 4: [action]\\nStep 5: [action]"
}

Be specific and actionable. Focus on the most impactful improvements first.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    // Fallback if Gemini fails
    return {
      summary: `Repository scored ${score}/100. ${metrics.hasReadme ? 'Has documentation.' : 'Missing README.'} ${metrics.hasTests ? 'Has tests.' : 'No tests detected.'} ${metrics.hasCICD ? 'CI/CD configured.' : 'No CI/CD setup.'}`,
      roadmap: generateFallbackRoadmap(metrics)
    };
  }
}

function generateFallbackRoadmap(metrics) {
  const steps = [];
  if (!metrics.hasReadme) steps.push('Add a comprehensive README.md with project overview, setup instructions, and usage examples');
  if (!metrics.hasTests) steps.push('Add unit tests for core functionality using a testing framework');
  if (!metrics.hasLicense) steps.push('Add a LICENSE file to clarify usage rights');
  if (!metrics.hasGitignore) steps.push('Add a .gitignore file to exclude unnecessary files');
  if (!metrics.hasCICD) steps.push('Set up CI/CD with GitHub Actions for automated testing');
  if (metrics.readmeQuality < 3) steps.push('Improve README with badges, code examples, and clear sections');
  if (metrics.commitFrequency === 'low') steps.push('Commit more frequently with meaningful commit messages');
  if (steps.length === 0) steps.push('Continue maintaining good practices and consider adding more documentation');
  return steps.map((s, i) => `Step ${i + 1}: ${s}`).join('\n');
}

export { evaluateRepo };