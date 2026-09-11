import { useEffect, useState } from "react";
import Modal from "../common/Modal";

function ProductFormModal({
  open,
  product,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    unit: "piece",
  });

  useEffect(() => {
    setForm({
      name: product?.name || "",
      category: product?.category || "",
      price: product?.price || "",
      stock: product?.stock || "",
      unit: product?.unit || "piece",
    });
  }, [product, open]);

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
      ...(product || {}),
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      unit: form.unit,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        product
          ? "Edit product"
          : "Add product"
      }
      subtitle="Keep your inventory up to date."
    >
      <form
        className="app-form"
        onSubmit={submit}
      >

        <div className="form-field">
          <label>Product name</label>

          <input
            value={form.name}
            onChange={(e) =>
              update("name", e.target.value)
            }
            placeholder="e.g. Dangote Cement"
            required
          />
        </div>

        <div className="form-row">

          <div className="form-field">
            <label>Category</label>

            <input
              value={form.category}
              onChange={(e) =>
                update(
                  "category",
                  e.target.value
                )
              }
              placeholder="Building materials"
            />
          </div>

          <div className="form-field">
            <label>Unit</label>

            <select
              value={form.unit}
              onChange={(e) =>
                update(
                  "unit",
                  e.target.value
                )
              }
            >
              <option value="piece">
                Piece
              </option>
              <option value="bag">
                Bag
              </option>
              <option value="box">
                Box
              </option>
              <option value="kg">
                Kilogram
              </option>
              <option value="litre">
                Litre
              </option>
            </select>
          </div>

        </div>

        <div className="form-row">

          <div className="form-field">
            <label>Selling price</label>

            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) =>
                update(
                  "price",
                  e.target.value
                )
              }
              placeholder="₦0"
            />
          </div>

          <div className="form-field">
            <label>Current stock</label>

            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) =>
                update(
                  "stock",
                  e.target.value
                )
              }
              placeholder="0"
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

            {product
              ? "Save changes"
              : "Add product"}
          </button>

        </div>

      </form>
    </Modal>
  );
}

export default ProductFormModal;