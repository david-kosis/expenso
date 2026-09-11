import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../services/api";
import { saveUser } from "../../api/storage";

function ProtectedRoute() {
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");

      // No token = definitely not logged in
      if (!token) {
        if (mounted) {
          setAuthenticated(false);
          setChecking(false);
        }

        return;
      }

      try {
        // Verify token against backend
        const user = await getCurrentUser();

        if (!user) {
          throw new Error("User not found");
        }

        saveUser(user);

        if (mounted) {
          setAuthenticated(true);
        }
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

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
      <div className="auth-loading-screen">
        <div className="auth-loading-card">
          <div className="auth-loading-logo">E</div>

          <div className="auth-spinner" />

          <h3>Loading Expenso</h3>

          <p>Checking your account...</p>
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