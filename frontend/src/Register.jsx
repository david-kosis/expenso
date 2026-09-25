import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "./services/api";
import "./auth-v2.css";

function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => passwordStrength(form.password), [form.password]);
  const strengthLabel = score >= 5 ? "Strong" : score >= 4 ? "Good" : score >= 2 ? "Needs work" : "Too weak";

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (form.name.trim().length < 2) return setMessage("Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setMessage("Enter a valid email address.");
    if (score < 4) return setMessage("Choose a stronger password: use at least 8 characters with upper/lowercase letters, numbers and a symbol.");
    if (form.password !== form.confirmPassword) return setMessage("Your passwords do not match.");
    if (!accepted) return setMessage("Please accept the terms before creating your account.");

    try {
      setLoading(true);
      const data = await registerUser(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      sessionStorage.setItem("pendingVerificationEmail", form.email.trim().toLowerCase());
      navigate("/login", { replace: true, state: { message: data.message } });
    } catch (error) {
      setMessage(error.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page-register">
      <section className="auth-brand-panel">
        <div className="auth-brand"><div className="auth-logo">E</div><div><strong>Expenso</strong><span>Business Manager</span></div></div>
        <div className="auth-brand-content">
          <span className="auth-eyebrow">START WITH A CLEAN SLATE</span>
          <h1>Build a clearer<br /><em>business day.</em></h1>
          <p>Set up your workspace once, then keep your customers, inventory and cash flow organized.</p>
          <div className="auth-trust-grid">
            <div><i className="fa-solid fa-user-check" /><span><b>Email verified</b><small>Account activation before access</small></span></div>
            <div><i className="fa-solid fa-lock" /><span><b>Protected passwords</b><small>Slow, salted password hashing</small></span></div>
            <div><i className="fa-solid fa-bolt" /><span><b>Fast setup</b><small>Only the information we need</small></span></div>
          </div>
        </div>
        <small className="auth-footer">© 2026 Expenso · Built for growing businesses</small>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card auth-card-register">
          <div className="auth-card-top"><span className="auth-mini-label">CREATE ACCOUNT</span><h2>Start using Expenso</h2><p>It takes less than a minute to set up your account.</p></div>
          {message && <div className="auth-alert" role="alert"><i className="fa-solid fa-circle-exclamation" />{message}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field"><label htmlFor="register-name">Full name</label><div className="auth-input"><i className="fa-regular fa-user" /><input id="register-name" name="name" type="text" autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" required /></div></div>
            <div className="auth-field"><label htmlFor="register-email">Email address</label><div className="auth-input"><i className="fa-regular fa-envelope" /><input id="register-email" name="email" type="email" autoComplete="username" inputMode="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" required /></div></div>
            <div className="auth-field">
              <label htmlFor="new-password">Password</label>
              <div className="auth-input"><i className="fa-solid fa-lock" /><input id="new-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" aria-describedby="password-help" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Create a strong password" required /><button type="button" className="auth-icon-button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}><i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"} /></button></div>
              <div id="password-help" className="password-meter"><div className="password-meter-track"><span style={{ width: `${Math.min(score / 6, 1) * 100}%` }} /></div><span>{strengthLabel} · Use 8+ characters, upper/lowercase, number and symbol.</span></div>
            </div>
            <div className="auth-field"><label htmlFor="confirm-password">Confirm password</label><div className="auth-input"><i className="fa-solid fa-lock" /><input id="confirm-password" name="confirmPassword" type={showConfirm ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Repeat your password" required /><button type="button" className="auth-icon-button" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? "Hide password" : "Show password"}><i className={showConfirm ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"} /></button></div></div>
            <label className="auth-check"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} /><span>I agree to the Expenso terms and privacy practices.</span></label>
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? <><span className="auth-spinner" /> Creating account…</> : <>Create account <i className="fa-solid fa-arrow-right" /></>}</button>
          </form>

          <div className="auth-divider"><span>ALREADY HAVE AN ACCOUNT?</span></div>
          <Link className="auth-secondary" to="/login">Sign in instead</Link>
          <p className="auth-legal">You’ll need to verify your email before you can access the dashboard.</p>
        </div>
      </section>
    </main>
  );
}

export default Register;
