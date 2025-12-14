# GitGrade

A scalable MERN stack application that evaluates public GitHub repositories and generates developer scores, summaries, and personalized improvement roadmaps using the Gemini API.

## Features

- Evaluate GitHub repositories based on code quality metrics
- Generate AI-powered summaries and improvement suggestions
- Responsive React frontend with Tailwind CSS
- Node.js backend with Express and MongoDB
- Modular and production-ready architecture

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **AI**: Google Gemini API
- **APIs**: GitHub API, Octokit

## Setup

1. Clone the repository
2. Set up MongoDB (local or cloud)
3. Configure environment variables

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```
MONGODB_URI=mongodb://localhost:27017/gitgrade
GITHUB_TOKEN=your_github_token_here  # Optional, for higher rate limits
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

1. Start MongoDB
2. Start the backend: `cd backend && npm run dev`
3. Start the frontend: `cd frontend && npm run dev`
4. Open http://localhost:5173

## API

### POST /api/repos/evaluate

Request body:
```json
{
  "url": "https://github.com/user/repo"
}
```

Response:
```json
{
  "repoUrl": "https://github.com/user/repo",
  "score": 85,
  "skillLevel": "Advanced",
  "summary": "Summary text...",
  "roadmap": "Step-by-step roadmap...",
  "metrics": { ... }
}
```

## Architecture

- **Separation of Concerns**: Analysis logic separated from AI reasoning
- **Caching**: Evaluations stored in MongoDB for performance
- **Modular Services**: Reusable components for fetching, analyzing, and scoring
- **Validation**: Input validation with Joi
- **Error Handling**: Comprehensive error handling and user feedback