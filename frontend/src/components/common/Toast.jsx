import { useEffect } from "react";

function Toast({
  message,
  type = "success",
  onClose,
}) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, 3500);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-exclamation",
    warning: "fa-triangle-exclamation",
    info: "fa-circle-info",
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        <i className={`fa-solid ${icons[type]}`} />
      </div>

      <div className="toast-content">
        <strong>
          {type === "error"
            ? "Something went wrong"
            : type === "warning"
            ? "Attention"
            : "Expenso"}
        </strong>

        <span>{message}</span>
      </div>

      <button onClick={onClose}>
        <i className="fa-solid fa-xmark" />
      </button>
    </div>
  );
}

export default Toast;