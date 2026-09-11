import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function VerifyCode() {

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const email =
    sessionStorage.getItem("resetEmail");


  const handleVerify = async (e) => {

    e.preventDefault();

    setMessage("");


    if (!email) {

      setMessage(
        "❌ Your password reset session has expired. Please start again."
      );

      return;
    }


    if (code.length !== 6) {

      setMessage(
        "Please enter the 6-digit verification code."
      );

      return;
    }


    setLoading(true);


    try {

      const response = await fetch(
        "http://localhost:5000/api/auth/verify-code",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            code,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.message ||
          "Invalid verification code."
        );

        setLoading(false);

        return;
      }


      // Save temporary reset token
      sessionStorage.setItem(
        "verificationResetToken",
        data.resetToken
      );


      setMessage(
        "✅ Code verified successfully."
      );


      setTimeout(() => {

        navigate("/reset-password");

      }, 700);


    } catch (error) {

      console.error(
        "VERIFY CODE ERROR:",
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

            Verify your
            <span>
              identity.
            </span>

          </h1>


          <p>

            Enter the verification code sent to your
            email to continue resetting your password.

          </p>


          <div className="features">


            <div className="feature">

              <div className="feature-icon">

                <i className="fa-solid fa-shield-halved"></i>

              </div>


              <div>

                <h4>
                  Secure verification
                </h4>

                <p>
                  Your code confirms that you own the account.
                </p>

              </div>

            </div>


            <div className="feature">

              <div className="feature-icon">

                <i className="fa-solid fa-clock"></i>

              </div>


              <div>

                <h4>
                  15 minute expiry
                </h4>

                <p>
                  Verification codes expire automatically.
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
              Enter Verification Code
            </h2>

            <p>
              We sent a 6-digit code to your email.
            </p>

          </div>


          {message && (

            <div className="message">

              {message}

            </div>

          )}


          <form onSubmit={handleVerify}>


            <div className="input-group">

              <label htmlFor="code">

                Verification code

              </label>


              <div className="input-wrapper">

                <i className="fa-solid fa-key"></i>


                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"

                  value={code}

                  onChange={(e) =>
                    setCode(
                      e.target.value.replace(/\D/g, "")
                    )
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
                ? "Verifying..."
                : "Verify Code"}

            </button>


            <div className="login-options">

              <a
                href="/forgot-password"
                className="forgot"
              >
                Send another code
              </a>


              <a
                href="/login"
                className="forgot"
              >
                Login
              </a>

            </div>


          </form>

        </div>

      </section>

    </div>

  );
}

export default VerifyCode;