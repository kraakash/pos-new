import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Use the URL exactly as requested. Change port to 5000 if your server runs there instead.
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/users`;

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  
  // 1. State to capture user input
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 2. State for feedback messages and loading status
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 3. This function handles both Login and Signup submissions
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the page from immediately reloading
    setError('');       // Clear previous errors
    setSuccess('');     // Clear previous success messages
    setIsLoading(true); // Start loading state

    try {
      // Determine if we are hitting /signup or /login
      const endpoint = mode === 'signup' ? '/signup' : '/login';
      const url = `${API_BASE_URL}${endpoint}`;

      // Build the data object that Express expects in req.body
      const payload = { email, password };
      if (mode === 'signup') {
        payload.name = name; 
      }

      // Make the actual network call to our Node.js/PostgreSQL backend
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Parse the JSON returned by Express
      const data = await response.json();

      // Check if Express returned a bad status (like 400 Bad Request or 401 Unauthorized)
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed. Please try again.');
      }

      // -> SUCCESS
      // We read the 'message' property sent from our Express Backend
      // which looks like { message: "Welcome username!", token: "..." }
      if (data.message) {
        setSuccess(data.message);
      } else {
        setSuccess(`Success! Welcome ${data.name || ''}`);
      }
      // Save JWT token so the Dashboard can use it
      localStorage.setItem('token', data.token);
      // Save user info for display in TopBar (no extra API call needed)
      localStorage.setItem('userName', data.name || '');
      localStorage.setItem('userEmail', data.email || '');

      // Instantly redirect to the Dashboard page!
      navigate('/dashboard');

    } catch (err) {
      console.error("Auth error:", err);
      // Show the actual error message sent from the backend
      setError(err.message);
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#121820] via-[#101a21] to-[#0d141e]">
      <div className="w-full max-w-md bg-[#161a23] rounded-xl shadow-2xl p-8 border border-[#202835]">
        
        {/* Toggle Nav */}
        <div className="mb-8 flex gap-3">
          <button 
            type="button" 
            onClick={() => {
              setMode('login');
              setError('');
              setSuccess('');
            }}
            className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              mode === 'login' 
                ? 'bg-[#40e0d0] text-black shadow-[0_0_15px_rgba(64,224,208,0.3)]' 
                : 'bg-transparent border border-[#2c3441] text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            Login
          </button>
          <button 
            type="button" 
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccess('');
            }}
            className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              mode === 'signup' 
                ? 'bg-[#40e0d0] text-black shadow-[0_0_15px_rgba(64,224,208,0.3)]' 
                : 'bg-transparent border border-[#2c3441] text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            Signup
          </button>
        </div>

        {/* Feedback Messages */}
        {error && <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 rounded bg-green-500/10 border border-green-500/50 text-green-400 text-sm">{success}</div>}

        {/* Form Fields binded with onSubmit */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input 
              type="text" 
              placeholder="Full name" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#242b3b] text-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40e0d0]/50 placeholder-gray-500 border border-transparent focus:border-[#40e0d0]/30 transition-all" 
            />
          )}
          <input 
            type="email" 
            placeholder="Email address" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#242b3b] text-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40e0d0]/50 placeholder-gray-500 border border-transparent focus:border-[#40e0d0]/30 transition-all" 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#242b3b] text-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40e0d0]/50 placeholder-gray-500 border border-transparent focus:border-[#40e0d0]/30 transition-all" 
          />
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full px-4 py-3 text-[15px] font-bold bg-[#40e0d0] hover:bg-[#3bc7b9] text-black rounded-lg transition-colors mt-2 shadow-[0_4px_14px_0_rgba(64,224,208,0.2)] hover:shadow-[0_6px_20px_rgba(64,224,208,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create account')}
          </button>
        </form>

        {/* Footer Link */}
        <a className="mt-8 inline-block text-[13px] font-medium text-[#40e0d0] hover:text-[#52efdf] hover:underline transition-colors" href="#">
          Continue with Google
        </a>
      </div>
    </div>
  );
}