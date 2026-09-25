import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../services/api";
import { saveUser, removeUser } from "../../api/storage";
import "./auth-loading.css";

export default function ProtectedRouteV2() {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(() => Boolean(location.state?.authUser));

  useEffect(() => {
    let mounted = true;

    const loginUser = location.state?.authUser;
    if (loginUser) saveUser(loginUser);

    getCurrentUser()
      .then((user) => {
        if (!mounted) return;
        if (!user) throw new Error("User not found");
        saveUser(user);
        setAuthenticated(true);
      })
      .catch(() => {
        // A successful login already authenticated this navigation. Keep the
        // dashboard mounted if the immediate session re-check races the
        // browser cookie write.
        if (!loginUser) {
          removeUser();
          if (mounted) setAuthenticated(false);
        }
      })
      .finally(() => {
        if (mounted) setChecking(false);
      });

    return () => { mounted = false; };
  }, []);

  if (checking) {
    return (
      <div className="auth-loading-screen" role="status" aria-live="polite">
        <div className="auth-loading-glow" />
        <div className="auth-loading-card">
          <div className="auth-loading-brand">
            <div className="auth-loading-logo">E</div>
            <div><strong>Expenso</strong><span>Business Manager</span></div>
          </div>
          <div className="auth-loading-loader"><span /></div>
          <div className="auth-loading-copy"><h2>Welcome back</h2><p>Securely checking your account...</p></div>
          <div className="auth-loading-dots" aria-hidden="true"><span /><span /><span /></div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
