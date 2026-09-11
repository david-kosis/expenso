function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "medium",
}) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className={`app-modal modal-${size}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>{title}</h2>

            {subtitle && (
              <p>{subtitle}</p>
            )}
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;