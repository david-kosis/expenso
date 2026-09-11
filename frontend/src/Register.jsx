import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "./services/api";

import "./App.css";
import "./modal/RegistrationSuccessModal.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  const [registeredEmail, setRegisteredEmail] =
    useState("");


  /* =====================================================
     HANDLE INPUT
  ===================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =====================================================
     REGISTER
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const name =
      formData.name.trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const password =
      formData.password;

    const confirmPassword =
      formData.confirmPassword;


    /* PASSWORD CHECK */

    if (
      password !==
      confirmPassword
    ) {
      setMessage(
        "Passwords do not match."
      );

      return;
    }


    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );

      return;
    }


    try {

      setLoading(true);

      const data =
        await registerUser(
          name,
          email,
          password
        );


      if (data) {

        /*
          Save the email so the modal can
          display it after the form is cleared.
        */

        setRegisteredEmail(
          email
        );


        /*
          Remove any previous error.
        */

        setMessage("");


        /*
          Show success modal.
        */

        setShowSuccessModal(
          true
        );


        /*
          Reset ALL form fields.

          confirmPassword is included so
          the controlled input never becomes
          uncontrolled.
        */

        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

      }

    } catch (error) {

      console.error(
        "REGISTER ERROR:",
        error
      );

      setMessage(
       
          "Registration failed."
      );

    } finally {

      setLoading(false);

    }
  };


  /* =====================================================
     CLOSE SUCCESS MODAL
  ===================================================== */

  const closeSuccessModal = () => {

    setShowSuccessModal(
      false
    );

    navigate("/login");

  };


  return (
    <div className="register-page">

      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <section className="left-side">

        <div className="welcome">

          <small>
            Business account management
          </small>


          <h1>
            Start managing your
            <span>business.</span>
          </h1>


          <p>
            Create your Expenso account and
            manage customers, suppliers, sales
            and payments from one place.
          </p>


          <div className="features">

            {/* FEATURE 1 */}

            <div className="feature">

              <div className="feature-icon">

                <i className="fa-solid fa-chart-line"></i>

              </div>


              <div>

                <h4>
                  Track your sales
                </h4>

                <p>
                  Monitor your business
                  transactions easily.
                </p>

              </div>

            </div>


            {/* FEATURE 2 */}

            <div className="feature">

              <div className="feature-icon">

                <i className="fa-solid fa-users"></i>

              </div>


              <div>

                <h4>
                  Manage customers
                </h4>

                <p>
                  Keep your customer accounts
                  organized.
                </p>

              </div>

            </div>


            {/* FEATURE 3 */}

            <div className="feature">

              <div className="feature-icon">

                <i className="fa-solid fa-file-invoice"></i>

              </div>


              <div>

                <h4>
                  Simple reports
                </h4>

                <p>
                  Understand your business
                  performance.
                </p>

              </div>

            </div>

          </div>

        </div>


        <div className="copyright">
          © 2026 Expenso. All rights reserved.
        </div>

      </section>


      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <section className="right-side">

        <div className="register-card">


          {/* HEADER */}

          <div className="register-header">

            <h2>
              Create your account
            </h2>

            <p>
              Fill in your details to get
              started with Expenso.
            </p>

          </div>


          {/* FORM */}

          <form
            id="registerForm"
            onSubmit={handleSubmit}
            className="register-form"
          >


            {/* =================================================
                FULL NAME
            ================================================= */}

            <div className="input-group">

              <label htmlFor="name">
                Full name
              </label>


              <div className="input-wrapper">

                <i className="fa-regular fa-user"></i>


                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="input-group">

              <label htmlFor="email">
                Email address
              </label>


              <div className="input-wrapper">

                <i className="fa-regular fa-envelope"></i>


                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>


              <div className="input-wrapper">

                <i className="fa-solid fa-lock"></i>


                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  <i
                    className={`fa-regular ${
                      showPassword
                        ? "fa-eye-slash"
                        : "fa-eye"
                    }`}
                  ></i>

                </button>

              </div>

            </div>


            {/* =================================================
                PASSWORD STRENGTH
            ================================================= */}

            <div
              className="password-strength"
              id="passwordStrength"
            >

              <div className="strength-bar">

                <div
                  className="strength-fill"
                  id="strengthFill"
                ></div>

              </div>


              <span
                className="strength-text"
                id="strengthText"
              >
                Password strength
              </span>

            </div>


            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div className="input-group">

              <label htmlFor="confirmPassword">
                Confirm password
              </label>


              <div className="input-wrapper">

                <i className="fa-solid fa-lock"></i>


                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  required
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  <i
                    className={`fa-regular ${
                      showConfirmPassword
                        ? "fa-eye-slash"
                        : "fa-eye"
                    }`}
                  ></i>

                </button>

              </div>

            </div>


            {/* =================================================
                TERMS
            ================================================= */}

            <label className="terms">

              <input
                type="checkbox"
                id="terms"
                required
              />


              <span>

                I agree to the{" "}

                <a
                  href="#"
                  onClick={(e) =>
                    e.preventDefault()
                  }
                >
                  Terms of Service
                </a>{" "}

                and{" "}

                <a
                  href="#"
                  onClick={(e) =>
                    e.preventDefault()
                  }
                >
                  Privacy Policy
                </a>.

              </span>

            </label>


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {message && (

              <div className="mess">

                <p>
                  {message}
                </p>

              </div>

            )}


            {/* =================================================
                REGISTER BUTTON
            ================================================= */}

            <button
              className="register-btn"
              type="submit"
              disabled={loading}
            >

              {loading
                ? "Creating Account..."
                : "Create Account"}

            </button>

          </form>


          {/* =================================================
              LOGIN LINK
          ================================================= */}

          <div className="login-link">

            Already have an account?{" "}

            <Link to="/login">
              Sign in
            </Link>

          </div>


        </div>

      </section>


      {/* =================================================
          SUCCESS MODAL
      ================================================= */}

      {showSuccessModal && (

        <div
          className="registration-modal-overlay"
          onClick={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              closeSuccessModal();
            }

          }}
        >

          <div className="registration-success-modal">

            {/* CLOSE */}

            <button
              type="button"
              className="registration-modal-close"
              onClick={
                closeSuccessModal
              }
              aria-label="Close"
            >

              <i className="fa-solid fa-xmark"></i>

            </button>


            {/* SUCCESS ICON */}

            <div className="registration-success-icon">

              <i className="fa-solid fa-check"></i>

            </div>


            {/* CONTENT */}

            <div className="registration-success-content">

              <h2>
                Registration successful!
              </h2>


              <p>
                Your Expenso account has been
                created successfully.
              </p>


              {registeredEmail && (

                <div className="registration-email">

                  <i className="fa-regular fa-envelope"></i>

                  <span>
                    {registeredEmail}
                  </span>

                </div>

              )}


              <p className="registration-instruction">
                You can now sign in to your
                account using your email and
                password.
              </p>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="button"
              className="registration-modal-button"
              onClick={
                closeSuccessModal
              }
            >
              Go to Login
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Register;