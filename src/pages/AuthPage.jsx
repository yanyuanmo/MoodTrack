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
        <div className="min-h-screen flex justify-center bg-gray-50 p-3">
            <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl bg-white shadow rounded px-6 py-5 sm:px-10 sm:pt-10 sm:pb-6 lg:px-12 lg:pt-12 lg:pb-8"
                 style={{ fontFamily: '"Comic Sans MS","Nunito","Quicksand","Poppins",cursive' }}>
                <h1
                    className="text-4xl md:text-5xl mb-6 text-center font-extrabold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-transparent bg-clip-text drop-shadow-sm"
                    style={{ fontFamily: '"Comic Sans MS","Nunito","Quicksand","Poppins",cursive' }}
                >
                    {mode === "login" ? "Login" : "Create Account"}
                </h1>
                {error && <div className="mb-3 text-sm text-rose-500 font-semibold">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-fuchsia-600" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="w-full border rounded px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base transition-colors focus:outline-none focus:ring focus:ring-pink-200 hover:border-pink-400 text-purple-700 placeholder-pink-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            disabled={loading}
                            required
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-fuchsia-600" htmlFor="password">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="w-full border rounded px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base transition-colors focus:outline-none focus:ring focus:ring-pink-200 pr-12 hover:border-pink-400 text-purple-700 placeholder-pink-300"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={mode === "login" ? "current-password" : "new-password"}
                                disabled={loading}
                                required
                                placeholder={mode === "login" ? "Your password" : "Choose a password"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(s => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-pink-500 hover:text-pink-700 hover:bg-pink-100 rounded px-2 sm:px-3 transition"
                                disabled={loading}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>
                    {mode === "register" && (
                        <div>
                            <label className="block text-sm font-medium mb-1 text-fuchsia-600" htmlFor="confirm">Confirm Password</label>
                            <input
                                id="confirm"
                                type={showPassword ? "text" : "password"}
                                className="w-full border rounded px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base transition-colors focus:outline-none focus:ring focus:ring-pink-200 hover:border-pink-400 text-purple-700 placeholder-pink-300"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                                disabled={loading}
                                required
                                placeholder="Repeat password"
                            />
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-400">
                            {mode === "login" ? "No account?" : "Already have an account?"}
                        </span>
                        <button
                            type="button"
                            className="text-xs sm:text-sm text-pink-500 hover:text-pink-700 hover:bg-pink-100 rounded px-2 sm:px-3 transition font-semibold"
                            onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); setConfirmPassword(""); }}
                            disabled={loading}
                        >
                            {mode === "login" ? "Create one" : "Sign in"}
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-sm sm:text-base font-semibold py-2 sm:py-3 rounded transition disabled:opacity-60 shadow"
                    >
                        {loading ? (mode === "login" ? "Signing in..." : "Creating...") : (mode === "login" ? "Sign In" : "Register")}
                    </button>
                </form>
                <p className="mt-3 text-xs text-center text-pink-400">
                    (Demo only — replace with real authentication later)
                </p>
            </div>
        </div>
    );
}

export default AuthPage;