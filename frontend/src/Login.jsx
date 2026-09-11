
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "./services/api";

import "./App.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(
        cleanEmail,
        password
      );

      /*
        Only save authentication after the backend
        has successfully authenticated the user.
      */

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      navigate("/", {
        replace: true,
      });

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (
        error.status === 403
      ) {
        setMessage(
          error.message ||
            "Please verify your email before logging in."
        );

        return;
      }

      setMessage(
        error.message ||
          "Login failed."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">

      <section className="left-side">

        <div className="welcome">

          <small>
            Business account management
          </small>

          <h1>
            Manage your business
            <span>smarter.</span>
          </h1>

          <p>
            Keep track of customers, suppliers, sales and
            payments all in one simple place.
          </p>

          <div className="features">

            <div className="feature">

              <div className="feature-icon">
                <i className="fa-solid fa-chart-line"></i>
              </div>

              <div>
                <h4>Track your sales</h4>

                <p>
                  Monitor your business transactions easily.
                </p>
              </div>

            </div>


            <div className="feature">

              <div className="feature-icon">
                <i className="fa-solid fa-users"></i>
              </div>

              <div>
                <h4>Manage customers</h4>

                <p>
                  Keep all your customer accounts organized.
                </p>
              </div>

            </div>


            <div className="feature">

              <div className="feature-icon">
                <i className="fa-solid fa-file-invoice"></i>
              </div>

              <div>
                <h4>Simple reports</h4>

                <p>
                  Get a clear view of your business performance.
                </p>
              </div>

            </div>

          </div>

        </div>

        <div className="copyright">
          © 2026 Expenso. All rights reserved.
        </div>

      </section>


      <section className="right-side">

        <div className="login-card">

          <div className="login-header">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to your Expenso account.
            </p>

          </div>


          <form
            id="loginForm"
            onSubmit={handleLogin}
          >

            {/* EMAIL */}

            <div className="input-group">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">

                <i className="fa-regular fa-envelope"></i>

                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <i className="fa-solid fa-lock"></i>

                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* OPTIONS */}

            <div className="login-options">

              <label className="remember">

                <input
                  type="checkbox"
                  id="remember"
                />

                Remember me

              </label>


              <Link
                to="/forgot-password"
                className="forgot"
              >
                Forgot password?
              </Link>

            </div>


            {/* MESSAGE */}

            {message && (
              <p className="mess">
                {message}
              </p>
            )}


            {/* LOGIN */}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Login"}
            </button>

          </form>


          <div className="divider">
            OR
          </div>


          <div className="signup">

            Don't have an account?

            <Link to="/register">
              Create account
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;
