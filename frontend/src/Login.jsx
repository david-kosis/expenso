import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "./services/api";
import { saveUser } from "./api/storage";
import "./auth-v2.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return setMessage("Enter your email and password.");

    try {
      setLoading(true);
      const data = await loginUser(cleanEmail, password);
      saveUser(data.user);

      if (!remember) sessionStorage.setItem("expensoSessionPreference", "session");
      else sessionStorage.removeItem("expensoSessionPreference");

      navigate(location.state?.from || "/", { replace: true });
    } catch (error) {
      if (error.status === 403 && error.data?.emailVerificationRequired) setMessage("Please verify your email before signing in.");
      else if (error.status === 429) setMessage("Too many attempts. Please wait a few minutes and try again.");
      else setMessage(error.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="auth-logo">E</div>
          <div><strong>Expenso</strong><span>Business Manager</span></div>
        </div>
        <div className="auth-brand-content">
          <span className="auth-eyebrow">BUSINESS CONTROL CENTER</span>
          <h1>Your business,<br /><em>under control.</em></h1>
          <p>Customers, inventory, suppliers, transactions and reports in one focused workspace.</p>
          <div className="auth-trust-grid">
            <div><i className="fa-solid fa-shield-halved" /><span><b>Private by design</b><small>Secure server-side sessions</small></span></div>
            <div><i className="fa-solid fa-chart-line" /><span><b>See what matters</b><small>Simple business insights</small></span></div>
            <div><i className="fa-solid fa-mobile-screen-button" /><span><b>Works everywhere</b><small>Built for desktop and mobile</small></span></div>
          </div>
        </div>
        <small className="auth-footer">© 2026 Expenso · Built for growing businesses</small>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-top">
            <span className="auth-mini-label">WELCOME BACK</span>
            <h2>Sign in to Expenso</h2>
            <p>Continue to your business dashboard.</p>
          </div>

          {message && <div className="auth-alert" role="alert"><i className="fa-solid fa-circle-exclamation" />{message}</div>}

          <form onSubmit={handleLogin} noValidate>
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <div className="auth-input">
                <i className="fa-regular fa-envelope" />
                <input id="login-email" name="email" type="email" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row"><label htmlFor="current-password">Password</label><Link to="/forgot-password">Forgot password?</Link></div>
              <div className="auth-input">
                <i className="fa-solid fa-lock" />
                <input id="current-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                <button type="button" className="auth-icon-button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}><i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"} /></button>
              </div>
            </div>

            <label className="auth-check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /><span>Keep me signed in on this device</span></label>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? <><span className="auth-spinner" /> Signing in…</> : <>Sign in <i className="fa-solid fa-arrow-right" /></>}
            </button>
          </form>

          <div className="auth-divider"><span>NEW TO EXPENSO?</span></div>
          <Link className="auth-secondary" to="/register">Create a business account</Link>
          <p className="auth-legal">Authentication uses a protected HttpOnly session cookie; credentials are not kept in browser localStorage.</p>
        </div>
      </section>
    </main>
  );
}

export default Login;
