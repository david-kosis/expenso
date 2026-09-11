import Modal from "../common/Modal";

function DeleteCustomerModal({
  customer,
  onCancel,
  onConfirm,
}) {
  if (!customer) return null;

  return (
    <Modal
      open={!!customer}
      onClose={onCancel}
      title="Delete customer?"
      subtitle="This action cannot be undone."
      size="small"
    >
      <div className="delete-confirm-content">

        <div className="delete-warning-icon">
          <i className="fa-solid fa-trash"></i>
        </div>

        <p>
          You're about to delete{" "}
          <strong>{customer.name}</strong>.
        </p>

        <p className="delete-warning-text">
          All transactions belonging to this customer
          will also be removed.
        </p>

        <div className="modal-actions">

          <button
            className="secondary-button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="danger-button"
            onClick={onConfirm}
          >
            <i className="fa-solid fa-trash"></i>
            Delete customer
          </button>

        </div>
      </div>
    </Modal>
  );
}

export default DeleteCustomerModal;