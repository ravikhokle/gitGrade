import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Home({ user }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);
    try {
      const response = await axios.post('http://localhost:5000/api/repos/evaluate', { url });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !result) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/saved', {
        repoUrl: result.repoUrl,
        score: result.score,
        skillLevel: result.skillLevel,
        summary: result.summary,
        roadmap: result.roadmap
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaved(true);
    } catch (err) {
      setError('Failed to save result');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Evaluate Your Repository</h1>
        <p className="text-center text-gray-600 mb-6">Get personalized feedback and improvement roadmap</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/user/repository"
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Evaluating...
              </span>
            ) : 'Evaluate Repository'}
          </button>
        </form>
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {result && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600">{result.score}</div>
              <div className="text-xl text-gray-600">/100</div>
              <div className="text-lg font-semibold text-gray-800 mt-2">{result.skillLevel}</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Summary</h3>
              <p className="text-gray-700">{result.summary}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Improvement Roadmap</h3>
              <div className="text-gray-700 whitespace-pre-line">{result.roadmap}</div>
            </div>
            
            {/* Save Section */}
            <div className="border-t pt-4">
              {user ? (
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`w-full p-3 rounded-lg transition-colors ${
                    saved 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-400'
                  }`}
                >
                  {saved ? '✓ Saved to Your Profile' : saving ? 'Saving...' : 'Save Result'}
                </button>
              ) : (
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-700">
                    <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
                    {' '}to save your results and track your progress
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}