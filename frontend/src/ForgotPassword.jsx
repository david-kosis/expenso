import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setLoading(true);


    try {

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        setMessage(
          data.message ||
          "Something went wrong."
        );

        setLoading(false);

        return;
      }


      // Save email for verification
      sessionStorage.setItem(
        "resetEmail",
        email.toLowerCase().trim()
      );


      setMessage(
        "✅ Reset link and verification code sent to your email."
      );


      // Go to recovery options
      setTimeout(() => {

        navigate("/recovery-options");

      }, 1000);


    } catch (error) {

      console.error(
        "FORGOT PASSWORD ERROR:",
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
            Business account management
          </small>


          <h1>

            Start managing your
            <span>
              business.
            </span>

          </h1>


          <p>

            Create your Expenso account and manage
            customers, suppliers, sales and payments
            from one place.

          </p>


          <div className="features">

            <div className="feature">

              <div className="feature-icon">
                <i className="fa-solid fa-chart-line"></i>
              </div>

              <div>

                <h4>
                  Track your sales
                </h4>

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

                <h4>
                  Manage customers
                </h4>

                <p>
                  Keep your customer accounts organized.
                </p>

              </div>

            </div>


            <div className="feature">

              <div className="feature-icon">
                <i className="fa-solid fa-file-invoice"></i>
              </div>

              <div>

                <h4>
                  Simple reports
                </h4>

                <p>
                  Understand your business performance.
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
              Forgot Password?
            </h2>

            <p>
              Enter your email and we'll send you
              a reset link and verification code.
            </p>

          </div>


          {message && (

            <div className="message">

              {message}

            </div>

          )}


          <form onSubmit={handleSubmit}>


            <div className="input-group">

              <label htmlFor="email">
                Email address
              </label>


              <div className="input-wrapper">

                <i className="fa-regular fa-envelope"></i>


                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}

                  onChange={(e) =>
                    setEmail(e.target.value)
                  }

                  required
                />

              </div>

            </div>


            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >

              {loading
                ? "Sending..."
                : "Send Recovery Options"}

            </button>


            <div className="login-options">

              <a
                href="/login"
                className="forgot"
              >
                Login
              </a>


              <a
                href="/register"
                className="forgot"
              >
                Sign Up
              </a>

            </div>


          </form>

        </div>

      </section>

    </div>

  );
}

export default ForgotPassword;