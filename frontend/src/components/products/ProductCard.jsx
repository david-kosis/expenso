function ProductCard({
  product,
  onEdit,
  onDelete,
}) {
  const money = (value) =>
    `₦${Number(value || 0).toLocaleString(
      "en-NG"
    )}`;

  const stock = Number(
    product.stock || 0
  );

  let stockClass = "stock-good";
  let stockText = "In stock";

  if (stock === 0) {
    stockClass = "stock-empty";
    stockText = "Out of stock";
  } else if (stock <= 5) {
    stockClass = "stock-low";
    stockText = "Low stock";
  }

  const initials =
    product.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "PR";

  return (
    <article className="product-card">

      <div className="product-card-top">

        <div className="product-image">
          {initials}
        </div>

        <div className="product-menu">

          <button
            onClick={() => onEdit(product)}
          >
            <i className="fa-solid fa-pen" />
          </button>

          <button
            className="danger-icon"
            onClick={() =>
              onDelete(product)
            }
          >
            <i className="fa-solid fa-trash" />
          </button>

        </div>

      </div>

      <div className="product-information">

        <span className="product-category">
          {product.category ||
            "Uncategorised"}
        </span>

        <h3>{product.name}</h3>

        <strong>
          {money(product.price)}
        </strong>

      </div>

      <div className="product-stock">

        <div>
          <span>Stock</span>

          <strong>
            {stock} {product.unit || "piece"}
            {stock !== 1 ? "s" : ""}
          </strong>
        </div>

        <span
          className={`stock-badge ${stockClass}`}
        >
          <i className="fa-solid fa-circle" />
          {stockText}
        </span>

      </div>

    </article>
  );
}

export default ProductCard;