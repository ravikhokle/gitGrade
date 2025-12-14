import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">GitGrade</Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
            {user ? (
              <>
                <Link to="/saved" className="text-gray-600 hover:text-blue-600">Saved</Link>
                <span className="text-gray-700">{user.name}</span>
                <button onClick={onLogout} className="text-gray-600 hover:text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
                <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}