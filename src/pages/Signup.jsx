import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { isFirebaseConfigured } from "../services/firebase.js";
import {
  validateEmail,
  validatePassword,
} from "../services/authService.js";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
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
    const { error: err } = await register(
      email,
      password,
      name.trim() || undefined
    );
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <AuthCard
      title="Create an account"
      subtitle="Save trips and generate AI itineraries."
    >
      {!isFirebaseConfigured() ? (
        <p className="auth-banner auth-banner--warn" role="alert">
          Add Firebase keys in a <code>.env</code> file (see{" "}
          <code>.env.example</code>) to enable sign-up.
        </p>
      ) : null}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className="auth-banner auth-banner--error" role="alert">
            {error}
          </p>
        ) : null}
        <label className="auth-field">
          <span className="auth-field__label">Name (optional)</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        <p className="auth-hint">Use at least 6 characters for your password.</p>
        <button
          type="submit"
          className="auth-button"
          disabled={submitting || !isFirebaseConfigured()}
        >
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthCard>
  );
}
