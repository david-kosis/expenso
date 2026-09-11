import "./RegistrationSuccessModal.css";

function RegistrationSuccessModal({
  isOpen,
  email,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="registration-modal-overlay">

      <div className="registration-success-modal">

        {/* Close button */}
        <button
          type="button"
          className="registration-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>


        {/* Success icon */}
        <div className="registration-success-icon">
          <i className="fa-solid fa-check"></i>
        </div>


        {/* Content */}
        <div className="registration-success-content">

          <h2>
            Registration successful!
          </h2>

          <p>
            Your account has been created successfully.
          </p>

          <p className="registration-email-message">
            We sent a verification link to
          </p>

          {email && (
            <div className="registration-email">
              <i className="fa-regular fa-envelope"></i>
              <span>{email}</span>
            </div>
          )}

          <p className="registration-instruction">
            Please check your email and click the
            verification link to activate your account.
          </p>

        </div>


        {/* Button */}
        <button
          type="button"
          className="registration-modal-button"
          onClick={onClose}
        >
          Got it
        </button>

      </div>

    </div>
  );
}

export default RegistrationSuccessModal;