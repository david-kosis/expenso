import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "./services/api";
import "./auth-v2.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      setLoading(true);
      const data = await forgotPassword(email.trim().toLowerCase());
      sessionStorage.setItem("resetEmail", email.trim().toLowerCase());
      setMessage(data.message);
      setTimeout(() => navigate("/recovery-options"), 700);
    } catch (error) {
      setMessage(error.message || "Unable to start recovery.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand"><div className="auth-logo">E</div><div><strong>Expenso</strong><span>Business Manager</span></div></div>
        <div className="auth-brand-content"><span className="auth-eyebrow">ACCOUNT RECOVERY</span><h1>Get back to<br /><em>business.</em></h1><p>We’ll send a short-lived recovery link and verification code to your email.</p><div className="auth-trust-grid"><div><i className="fa-solid fa-shield-halved" /><span><b>Short-lived recovery</b><small>Recovery credentials expire automatically</small></span></div><div><i className="fa-solid fa-envelope" /><span><b>Email confirmation</b><small>Recovery stays tied to your account email</small></span></div></div></div>
        <small className="auth-footer">© 2026 Expenso · Secure account recovery</small>
      </section>
      <section className="auth-form-panel"><div className="auth-card">
        <div className="auth-card-top"><span className="auth-mini-label">FORGOT PASSWORD</span><h2>Recover your account</h2><p>Enter the email you use for Expenso.</p></div>
        {message && <div className="auth-alert" role="status"><i className="fa-solid fa-circle-info" />{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="auth-field"><label htmlFor="recovery-email">Email address</label><div className="auth-input"><i className="fa-regular fa-envelope" /><input id="recovery-email" name="email" type="email" autoComplete="username" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required /></div></div>
          <button className="auth-submit" disabled={loading}>{loading ? "Sending…" : "Send recovery instructions"}</button>
        </form>
        <div className="auth-divider"><span>REMEMBERED IT?</span></div><Link className="auth-secondary" to="/login">Back to sign in</Link>
      </div></section>
    </main>
  );
}
