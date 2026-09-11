
function AccountAlertModal({
  isOpen,
  title = "Success",
  message,
  type = "success",
  buttonText = "OK",
  onClose,
}) {
  if (!isOpen) return null;

  const icon =
    type === "success"
      ? "fa-circle-check"
      : type === "error"
      ? "fa-circle-xmark"
      : type === "warning"
      ? "fa-triangle-exclamation"
      : "fa-circle-info";

  return (
    <div
      className="account-alert-overlay"
      onMouseDown={onClose}
    >
      <div
        className={`account-alert-modal ${type}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="account-alert-close"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        <div className="account-alert-icon">
          <i className={`fa-solid ${icon}`} />
        </div>

        <div className="account-alert-content">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>

        <button
          type="button"
          className="account-alert-button"
          onClick={onClose}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default AccountAlertModal;
