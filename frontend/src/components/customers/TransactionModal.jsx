import { useEffect, useState } from "react";
import Modal from "../common/Modal";

function TransactionModal({
  open,
  customer,
  transaction,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    date: "",
    goods: "",
    qty: "",
    price: "",
    paid: "",
  });

  useEffect(() => {
    if (transaction) {
      setForm({
        date: transaction.date || "",
        goods: transaction.goods || "",
        qty: transaction.qty || "",
        price: transaction.price || "",
        paid: transaction.paid || "",
      });
    } else {
      setForm({
        date: new Date().toISOString().split("T")[0],
        goods: "",
        qty: "",
        price: "",
        paid: "",
      });
    }
  }, [transaction, open]);

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const total =
    (Number(form.qty) || 0) *
    (Number(form.price) || 0);

  const paid = Math.min(
    Number(form.paid) || 0,
    total
  );

  const owing = Math.max(
    total - paid,
    0
  );

  const status =
    total > 0 && owing === 0
      ? "Settled"
      : "Owing";

  const submit = (e) => {
    e.preventDefault();

    if (!form.goods.trim()) return;
    if (Number(form.qty) <= 0) return;
    if (Number(form.price) <= 0) return;

    onSave({
      ...(transaction || {}),
      date: form.date,
      goods: form.goods.trim(),
      qty: Number(form.qty),
      price: Number(form.price),
      paid,
    });
  };

  const money = (value) =>
    `₦${Number(value || 0).toLocaleString("en-NG")}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        transaction
          ? "Edit transaction"
          : "Add transaction"
      }
      subtitle={
        customer
          ? `Transaction for ${customer.name}`
          : ""
      }
      size="medium"
    >
      <form
        className="app-form"
        onSubmit={submit}
      >
        <div className="form-row">

          <div className="form-field">
            <label>Date</label>

            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                update("date", e.target.value)
              }
              required
            />
          </div>

          <div className="form-field">
            <label>Goods / product</label>

            <input
              value={form.goods}
              onChange={(e) =>
                update("goods", e.target.value)
              }
              placeholder="e.g. Cement"
              required
            />
          </div>

        </div>

        <div className="form-row">

          <div className="form-field">
            <label>Quantity</label>

            <input
              type="number"
              min="1"
              value={form.qty}
              onChange={(e) =>
                update("qty", e.target.value)
              }
              placeholder="0"
              required
            />
          </div>

          <div className="form-field">
            <label>Price per unit</label>

            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) =>
                update("price", e.target.value)
              }
              placeholder="₦0"
              required
            />
          </div>

        </div>

        <div className="form-field">
          <label>Amount paid</label>

          <input
            type="number"
            min="0"
            value={form.paid}
            onChange={(e) =>
              update("paid", e.target.value)
            }
            placeholder="₦0"
          />
        </div>

        <div className="transaction-preview">

          <div>
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>

          <div>
            <span>Paid</span>
            <strong className="preview-paid">
              {money(paid)}
            </strong>
          </div>

          <div>
            <span>Balance</span>
            <strong className="preview-owing">
              {money(owing)}
            </strong>
          </div>

          <div className="preview-status">
            <span>Status</span>

            <strong
              className={
                status === "Settled"
                  ? "status-settled"
                  : "status-owing"
              }
            >
              <i className="fa-solid fa-circle" />
              {status}
            </strong>
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
            Save transaction
          </button>

        </div>
      </form>
    </Modal>
  );
}

export default TransactionModal;