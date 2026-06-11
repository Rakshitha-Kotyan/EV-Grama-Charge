import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";

export default function Register() {
  // useState stores form data — whenever a field changes, React re-renders the UI
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "rider",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // useNavigate lets us redirect the user to another page programmatically

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // ...formData spreads existing values, then [e.target.name] updates only the changed field
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // e.preventDefault() stops the browser from refreshing the page on form submit
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/register", formData);
      // Sending POST request to our backend with form data
      localStorage.setItem("token", res.data.token);
      // Storing JWT token in localStorage so it persists across page refreshes
      localStorage.setItem("user", JSON.stringify(res.data.user));
      // Storing user info so we can display name, role etc anywhere in the app
      navigate("/map");
      // Redirect to map page after successful register
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      // Show the error message from backend, or a fallback message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      {/* min-h-screen = full viewport height, flex+items-center+justify-center = perfectly centered */}
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">⚡ EV-Grama</h1>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
          // Only renders if error state is not empty
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* space-y-5 adds equal vertical spacing between all form fields */}

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Rakshitha"
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">I am a</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
            >
              <option value="rider">🏍️ Rider — looking for charging</option>
              <option value="host">🏪 Host — offering my socket</option>
            </select>
            {/* Dropdown lets user pick their role — matches our User model's enum */}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-dark font-bold py-3 rounded-lg hover:bg-primary/80 transition-all disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
            {/* Shows loading text while API call is in progress */}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}