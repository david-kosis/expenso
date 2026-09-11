import { useNavigate } from "react-router-dom";
import "./App.css";

function RecoveryOptions() {

  const navigate = useNavigate();

  const handleLinkOption = () => {

    alert(
      "Check your email and click the Reset Password button."
    );

  };


  const handleCodeOption = () => {

    navigate("/verify-code");

  };


  return (

    <div className="register-page">

      <section className="left-side">

        <div className="welcome">

          <small>
            Secure account recovery
          </small>


          <h1>

            Choose your
            <span>
              recovery method.
            </span>

          </h1>


          <p>

            We sent two recovery options to your email.
            Choose whichever is easier for you.

          </p>


          <div className="features">


            <div className="feature">

              <div className="feature-icon">

                <i className="fa-solid fa-link"></i>

              </div>


              <div>

                <h4>
                  Reset link
                </h4>

                <p>
                  Simply click the password reset link
                  in your email.
                </p>

              </div>

            </div>


            <div className="feature">

              <div className="feature-icon">

                <i className="fa-solid fa-key"></i>

              </div>


              <div>

                <h4>
                  Verification code
                </h4>

                <p>
                  Enter the 6-digit code from your email.
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
              Choose an option
            </h2>

            <p>
              How would you like to reset your password?
            </p>

          </div>


          {/* RESET LINK */}

          <button
            type="button"
            className="register-btn"
            onClick={handleLinkOption}
            style={{
              marginBottom: "15px",
            }}
          >

            <i className="fa-solid fa-link"></i>

            &nbsp;

            Use Reset Link

          </button>


          {/* VERIFICATION CODE */}

          <button
            type="button"
            className="register-btn"
            onClick={handleCodeOption}
          >

            <i className="fa-solid fa-key"></i>

            &nbsp;

            Enter Verification Code

          </button>


          <div className="login-options">

            <a
              href="/forgot-password"
              className="forgot"
            >
              Start again
            </a>


            <a
              href="/login"
              className="forgot"
            >
              Login
            </a>

          </div>


        </div>

      </section>

    </div>

  );
}

export default RecoveryOptions;