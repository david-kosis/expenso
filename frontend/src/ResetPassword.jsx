import { useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./App.css";

function ResetPassword() {

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { token } = useParams();


  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");


    // =================================================
    // PASSWORD VALIDATION
    // =================================================

    if (password.length < 6) {

      setMessage(
        "Password must be at least 6 characters."
      );

      return;
    }


    if (password !== confirmPassword) {

      setMessage(
        "Passwords do not match."
      );

      return;
    }


    // =================================================
    // DETERMINE RESET METHOD
    // =================================================

    let url =
      "http://localhost:5000/api/auth/reset-password";

    let body = {
      password,
    };


    // =================================================
    // OPTION 1: EMAIL RESET LINK
    // =================================================

    if (token) {

      url =
        `http://localhost:5000/api/auth/reset-password/${token}`;

    }


    // =================================================
    // OPTION 2: VERIFICATION CODE
    // =================================================

    else {

      const verificationResetToken =
        sessionStorage.getItem(
          "verificationResetToken"
        );


      if (!verificationResetToken) {

        setMessage(
          "❌ Your reset session has expired. Please request a new code."
        );

        return;
      }


      body.resetToken =
        verificationResetToken;

    }


    setLoading(true);


    // =================================================
    // SEND REQUEST
    // =================================================

    try {

      const response = await fetch(
        url,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(body),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.message ||
          "Unable to reset password."
        );

        setLoading(false);

        return;
      }


      // =================================================
      // SUCCESS
      // =================================================

      setMessage(
        "✅ Password reset successful!"
      );


      // Clear reset information
      sessionStorage.removeItem(
        "resetEmail"
      );

      sessionStorage.removeItem(
        "verificationResetToken"
      );


      // Return to login
      setTimeout(() => {

        navigate("/login");

      }, 1500);


    } catch (error) {

      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      setMessage(
        "❌ Cannot connect to server"
      );

    }


    setLoading(false);
  };


  return (

    <div className="register-page">


      <section className="left-side">

        <div className="welcome">

          <small>
            Secure account recovery
          </small>


          <h1>

            Create a new
            <span>
              password.
            </span>

          </h1>


          <p>

            Choose a strong password to protect
            your Expenso account.

          </p>


          <div className="features">


            <div className="feature">

              <div className="feature-icon">

                <i className="fa-solid fa-lock"></i>

              </div>


              <div>

                <h4>
                  Secure password
                </h4>

                <p>
                  Your password is securely encrypted.
                </p>

              </div>

            </div>


            <div className="feature">

              <div className="feature-icon">

                <i className="fa-solid fa-shield-halved"></i>

              </div>


              <div>

                <h4>
                  Account protection
                </h4>

                <p>
                  Your old password will no longer work.
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

        <div className="register-card">


          <div className="register-header">

            <h2>
              Reset Password
            </h2>

            <p>
              Enter your new password below.
            </p>

          </div>


          {message && (

            <div className="message">

              {message}

            </div>

          )}


          <form onSubmit={handleSubmit}>


            {/* PASSWORD */}

            <div className="input-group">

              <label htmlFor="password">

                New password

              </label>


              <div className="input-wrapper">

                <i className="fa-solid fa-lock"></i>


                <input
                  id="password"
                  type="password"
                  placeholder="Enter new password"

                  value={password}

                  onChange={(e) =>
                    setPassword(e.target.value)
                  }

                  required
                />

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="input-group">

              <label htmlFor="confirmPassword">

                Confirm password

              </label>


              <div className="input-wrapper">

                <i className="fa-solid fa-lock"></i>


                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"

                  value={confirmPassword}

                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }

                  required
                />

              </div>

            </div>


            {/* BUTTON */}

            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >

              {loading
                ? "Resetting..."
                : "Reset Password"}

            </button>


            <div className="login-options">

              <a
                href="/login"
                className="forgot"
              >
                Back to Login
              </a>

            </div>


          </form>

        </div>

      </section>

    </div>

  );
}

export default ResetPassword;