import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../services/api";
import { saveUser } from "../../api/storage";
import "./auth-loading.css";

function ProtectedRoute() {
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (mounted) {
          setAuthenticated(false);
          setChecking(false);
        }
        return;
      }

      try {
        const user = await getCurrentUser();

        if (!user) {
          throw new Error("User not found");
        }

        saveUser(user);

        if (mounted) {
          setAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (mounted) {
          setAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="auth-loading-screen" role="status" aria-live="polite">
        <div className="auth-loading-glow" />

        <div className="auth-loading-card">
          <div className="auth-loading-brand">
            <div className="auth-loading-logo">E</div>
            <div>
              <strong>Expenso</strong>
              <span>Business Manager</span>
            </div>
          </div>

          <div className="auth-loading-loader">
            <span />
          </div>

          <div className="auth-loading-copy">
            <h2>Welcome back</h2>
            <p>Securely checking your account...</p>
          </div>

          <div className="auth-loading-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
