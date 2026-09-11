function SupplierCard({
  supplier,
  onEdit,
  onDelete,
  onAddPurchase,
  onEditPurchase,
}) {
  const purchases =
    Array.isArray(supplier.purchases)
      ? supplier.purchases
      : [];

  const money = (value) =>
    `₦${Number(value || 0).toLocaleString(
      "en-NG"
    )}`;

  const total = purchases.reduce(
    (sum, purchase) =>
      sum + Number(purchase.amount || 0),
    0
  );

  const paid = purchases.reduce(
    (sum, purchase) =>
      sum +
      Math.min(
        Number(purchase.paid || 0),
        Number(purchase.amount || 0)
      ),
    0
  );

  const outstanding = Math.max(
    total - paid,
    0
  );

  const initials =
    supplier.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "SU";

  return (
    <article className="supplier-card">

      <div className="customer-card-top">

        <div className="customer-profile">

          <div className="supplier-avatar">
            {initials}
          </div>

          <div className="customer-details">
            <h3>{supplier.name}</h3>

            <span>
              {supplier.phone ||
                supplier.email ||
                "No contact information"}
            </span>
          </div>

        </div>

        <div className="customer-card-menu">

          <button
            onClick={() => onEdit(supplier)}
          >
            <i className="fa-solid fa-pen" />
          </button>

          <button
            className="danger-icon"
            onClick={() =>
              onDelete(supplier)
            }
          >
            <i className="fa-solid fa-trash" />
          </button>

        </div>

      </div>

      <div className="customer-balance">

        <div>
          <span>Total purchases</span>
          <strong>{money(total)}</strong>
        </div>

        <div>
          <span>Paid</span>
          <strong className="balance-paid">
            {money(paid)}
          </strong>
        </div>

        <div>
          <span>Outstanding</span>
          <strong className="balance-owing">
            {money(outstanding)}
          </strong>
        </div>

      </div>

      <div className="customer-transactions">

        <div className="transactions-heading">

          <div>
            <h4>Purchases</h4>

            <span>
              {purchases.length} records
            </span>
          </div>

          <button
            className="add-transaction-button"
            onClick={() =>
              onAddPurchase(supplier)
            }
          >
            <i className="fa-solid fa-plus" />
            Add
          </button>

        </div>

        {purchases.length === 0 ? (
          <div className="transaction-empty">

            <i className="fa-regular fa-file-lines" />

            <span>
              No purchases yet
            </span>

            <button
              onClick={() =>
                onAddPurchase(supplier)
              }
            >
              Record first purchase
            </button>

          </div>
        ) : (
          <div className="transaction-items">

            {purchases.map((purchase) => {

              const amount =
                Number(purchase.amount || 0);

              const paidAmount =
                Math.min(
                  Number(purchase.paid || 0),
                  amount
                );

              const outstanding =
                Math.max(
                  amount - paidAmount,
                  0
                );

              return (
                <div
                  className="transaction-item"
                  key={purchase.id}
                >

                  <div className="transaction-product">

                    <div className="product-dot supplier-dot">
                      <i className="fa-solid fa-truck" />
                    </div>

                    <div>
                      <strong>
                        {purchase.goods}
                      </strong>

                      <span>
                        {purchase.date}
                      </span>
                    </div>

                  </div>

                  <div className="transaction-amount">

                    <strong>
                      {money(amount)}
                    </strong>

                    <span
                      className={
                        outstanding === 0
                          ? "transaction-status settled"
                          : "transaction-status owing"
                      }
                    >
                      {outstanding === 0
                        ? "Settled"
                        : `${money(
                            outstanding
                          )} owing`}
                    </span>

                  </div>

                  <button
                    className="transaction-edit"
                    onClick={() =>
                      onEditPurchase(
                        supplier,
                        purchase
                      )
                    }
                  >
                    <i className="fa-solid fa-pen" />
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </article>
  );
}

export default SupplierCard;