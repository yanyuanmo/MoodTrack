import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthPage(){
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    const validate = () => {
        if (!email || !password) return "Email and password are required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email.";
        if (password.length < 6) return "Password must be at least 6 characters.";
        if (mode === "register") {
            if (!confirmPassword) return "Please confirm your password.";
            if (confirmPassword !== password) return "Passwords do not match.";
        }
        return "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const v = validate();
        if (v) {
            setError(v);
            return;
        }
        setError("");
        setLoading(true);
        // Simulate auth; replace with real API later
        setTimeout(() => {
            setLoading(false);
            localStorage.setItem("isLoggedIn", "true"); // mark logged in
            navigate("/home");
        }, 800);
    };

    return (
        <div className="max-w-sm mx-auto mt-8 bg-white shadow rounded p-6">
            <h1 className="text-xl font-semibold mb-4 text-center">
                {mode === "login" ? "Login" : "Create Account"}
            </h1>
            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        disabled={loading}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200 pr-12"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                            disabled={loading}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(s => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-indigo-600"
                            disabled={loading}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>
                {mode === "register" && (
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="confirm">Confirm Password</label>
                        <input
                            id="confirm"
                            type={showPassword ? "text" : "password"}
                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            disabled={loading}
                            required
                        />
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {mode === "login" ? "No account?" : "Already have an account?"}
                    </span>
                    <button
                        type="button"
                        className="text-xs text-indigo-600 hover:underline"
                        onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); setConfirmPassword(""); }}
                        disabled={loading}
                    >
                        {mode === "login" ? "Create one" : "Sign in"}
                    </button>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded transition disabled:opacity-60"
                >
                    {loading ? (mode === "login" ? "Signing in..." : "Creating...") : (mode === "login" ? "Sign In" : "Register")}
                </button>
            </form>
            <p className="mt-4 text-xs text-center text-gray-500">
                (Demo only — replace with real authentication later)
            </p>
        </div>
    );
}

export default AuthPage;