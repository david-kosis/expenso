import { useEffect, useState } from "react";
import Modal from "../common/Modal";

function CustomerFormModal({
  open,
  customer,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
      });
    } else {
      setForm({
        name: "",
        phone: "",
        email: "",
        address: "",
      });
    }
  }, [customer, open]);

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    onSave({
      ...(customer || {}),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customer ? "Edit customer" : "Add customer"}
      subtitle={
        customer
          ? "Update this customer's information."
          : "Create a customer account."
      }
    >
      <form
        className="app-form"
        onSubmit={submit}
      >
        <div className="form-field">
          <label>Customer name</label>

          <div className="input-with-icon">
            <i className="fa-regular fa-user" />

            <input
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
              placeholder="e.g. John Williams"
              required
            />
          </div>
        </div>

        <div className="form-row">

          <div className="form-field">
            <label>Phone number</label>

            <div className="input-with-icon">
              <i className="fa-solid fa-phone" />

              <input
                value={form.phone}
                onChange={(e) =>
                  update("phone", e.target.value)
                }
                placeholder="080..."
              />
            </div>
          </div>

          <div className="form-field">
            <label>Email</label>

            <div className="input-with-icon">
              <i className="fa-regular fa-envelope" />

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  update("email", e.target.value)
                }
                placeholder="customer@email.com"
              />
            </div>
          </div>

        </div>

        <div className="form-field">
          <label>Address</label>

          <div className="input-with-icon textarea-wrapper">
            <i className="fa-solid fa-location-dot" />

            <textarea
              value={form.address}
              onChange={(e) =>
                update("address", e.target.value)
              }
              placeholder="Customer address"
              rows="3"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            <i className="fa-solid fa-check" />

            {customer
              ? "Save changes"
              : "Create customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CustomerFormModal;