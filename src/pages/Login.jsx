import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { isFirebaseConfigured } from "../services/firebase.js";
import {
  validateEmail,
  validatePassword,
} from "../services/authService.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    const passErr = validatePassword(password);
    if (passErr) {
      setError(passErr);
      return;
    }
    setSubmitting(true);
    const { error: err } = await login(email, password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <AuthCard
      title="Log in"
      subtitle="Access your trips and itineraries."
    >
      {!isFirebaseConfigured() ? (
        <p className="auth-banner auth-banner--warn" role="alert">
          Add Firebase keys in a <code>.env</code> file (see{" "}
          <code>.env.example</code>) to enable sign-in.
        </p>
      ) : null}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className="auth-banner auth-banner--error" role="alert">
            {error}
          </p>
        ) : null}
        <label className="auth-field">
          <span className="auth-field__label">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="auth-field">
          <span className="auth-field__label">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        <button
          type="submit"
          className="auth-button"
          disabled={submitting || !isFirebaseConfigured()}
        >
          {submitting ? "Signing in…" : "Log in"}
        </button>
      </form>
      <p className="auth-footer">
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </AuthCard>
  );
}
