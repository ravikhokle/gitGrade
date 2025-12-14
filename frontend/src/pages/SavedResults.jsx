import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function SavedResults({ user }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchResults();
  }, [user]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
    } catch (err) {
      setError('Failed to load saved results');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/saved/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(results.filter(r => r._id !== id));
    } catch {
      setError('Failed to delete');
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Saved Results</h2>
          <p className="text-gray-600 mb-4">Please log in to view your saved results</p>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Saved Results</h2>
      
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      
      {!loading && results.length === 0 && (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <p className="text-gray-600">No saved results yet.</p>
          <Link to="/" className="text-blue-600 hover:underline">Evaluate a repository</Link>
        </div>
      )}

      <div className="space-y-4">
        {results.map((r) => (
          <div key={r._id} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <a href={r.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                  {r.repoUrl.replace('https://github.com/', '')}
                </a>
                <p className="text-sm text-gray-500">Saved {new Date(r.savedAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{r.score}</div>
                <div className="text-sm text-gray-600">{r.skillLevel}</div>
              </div>
            </div>
            <p className="text-gray-700 mb-3">{r.summary}</p>
            <details className="text-sm">
              <summary className="cursor-pointer text-blue-600 hover:underline">View Roadmap</summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-line text-gray-700">{r.roadmap}</div>
            </details>
            <button
              onClick={() => handleDelete(r._id)}
              className="mt-3 text-red-600 text-sm hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}