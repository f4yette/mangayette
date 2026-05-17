import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

function Login() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [username, setUsername] = useState("");
const [isSignUp, setIsSignUp] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [message, setMessage] = useState(null);
const navigate = useNavigate();

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
setError(null);
setMessage(null);
try {
if (isSignUp) {
const { data, error } = await supabase.auth.signUp({ email, password });
if (error) throw error;
const { error: profileError } = await supabase
.from("profiles")
.insert({ id: data.user.id, username });
if (profileError) {
if (profileError.code === "23505") {
throw new Error("Username already taken, please choose another.");
}
throw profileError;
}
setMessage("Check your email to confirm your account!");
} else {
const { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) throw error;
navigate("/");
}
    } catch (err) {
setError(err.message);
    } finally {
setLoading(false);
    }
  };

const handleForgotPassword = async () => {
if (!email) {
setError("Enter your email first then click forgot password.");
return;
    }
setLoading(true);
setError(null);
const { error } = await supabase.auth.resetPasswordForEmail(email, {
redirectTo: `${window.location.origin}/reset-password`,
    });
if (error) {
setError(error.message);
    } else {
setMessage("Password reset email sent! Check your inbox.");
    }
setLoading(false);
  };

return (
<div className="login-page">
      <div className="login-card">
        <h1>manga<span>yette</span></h1>
        <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
type="email"
placeholder="Email"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
/>
{isSignUp && (
<input
type="text"
placeholder="Username"
value={username}
onChange={(e) => setUsername(e.target.value)}
required
minLength={3}
maxLength={20}
/>
)}
          <input
type="password"
placeholder="Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
/>
{error && <p className="login-error">{error}</p>}
{message && <p className="login-message">{message}</p>}
          <button type="submit" disabled={loading}>
{loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>
{!isSignUp && (
<button className="forgot-btn" onClick={handleForgotPassword} disabled={loading}>
            Forgot password?
          </button>
)}
        <p className="login-switch">
{isSignUp ? "Already have an account?" : "Don't have an account?"}
          <span onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}>
{isSignUp ? " Login" : " Sign up"}
          </span>
        </p>
      </div>
    </div>
);
}

export default Login;