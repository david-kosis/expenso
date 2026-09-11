import { useEffect, useState } from "react";
import Modal from "../common/Modal";

function PurchaseModal({
  open,
  supplier,
  purchase,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    date: "",
    goods: "",
    amount: "",
    paid: "",
  });

  useEffect(() => {
    setForm({
      date:
        purchase?.date ||
        new Date()
          .toISOString()
          .split("T")[0],
      goods: purchase?.goods || "",
      amount: purchase?.amount || "",
      paid: purchase?.paid || "",
    });
  }, [purchase, open]);

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const amount =
    Number(form.amount) || 0;

  const paid = Math.min(
    Number(form.paid) || 0,
    amount
  );

  const outstanding =
    Math.max(amount - paid, 0);

  const submit = (e) => {
    e.preventDefault();

    if (!form.goods.trim()) return;
    if (amount <= 0) return;

    onSave({
      ...(purchase || {}),
      date: form.date,
      goods: form.goods.trim(),
      amount,
      paid,
    });
  };

  const money = (value) =>
    `₦${Number(value || 0).toLocaleString(
      "en-NG"
    )}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        purchase
          ? "Edit purchase"
          : "Record purchase"
      }
      subtitle={
        supplier
          ? `Purchase from ${supplier.name}`
          : ""
      }
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
            <label>Goods</label>

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
            <label>Total amount</label>

            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) =>
                update("amount", e.target.value)
              }
              placeholder="₦0"
              required
            />
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

        </div>

        <div className="transaction-preview">

          <div>
            <span>Purchase</span>
            <strong>{money(amount)}</strong>
          </div>

          <div>
            <span>Paid</span>
            <strong className="preview-paid">
              {money(paid)}
            </strong>
          </div>

          <div>
            <span>Outstanding</span>
            <strong className="preview-owing">
              {money(outstanding)}
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
            Save purchase
          </button>

        </div>

      </form>
    </Modal>
  );
}

export default PurchaseModal;