function CustomerCard({
  customer,
  onEdit,
  onDelete,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) {
  const transactions = Array.isArray(
    customer.transactions
  )
    ? customer.transactions
    : [];

  const money = (value) =>
    `₦${Number(value || 0).toLocaleString("en-NG")}`;

  const total = transactions.reduce(
    (sum, transaction) =>
      sum +
      Number(transaction.qty || 0) *
        Number(transaction.price || 0),
    0
  );

  const paid = transactions.reduce(
    (sum, transaction) =>
      sum +
      Math.min(
        Number(transaction.paid || 0),
        Number(transaction.qty || 0) *
          Number(transaction.price || 0)
      ),
    0
  );

  const owing = Math.max(
    total - paid,
    0
  );

  const initials =
    customer.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "CU";

  return (
    <article className="customer-card">

      {/* HEADER */}
      <div className="customer-card-top">

        <div className="customer-profile">

          <div className="customer-avatar">
            {initials}
          </div>

          <div className="customer-details">
            <h3>{customer.name}</h3>

            <span>
              {customer.phone ||
                customer.email ||
                "No contact information"}
            </span>
          </div>

        </div>

        <div className="customer-card-menu">

          <button
            onClick={() => onEdit(customer)}
            title="Edit customer"
          >
            <i className="fa-solid fa-pen" />
          </button>

          <button
            className="danger-icon"
            onClick={() => onDelete(customer)}
            title="Delete customer"
          >
            <i className="fa-solid fa-trash" />
          </button>

        </div>

      </div>

      {/* BALANCE */}
      <div className="customer-balance">

        <div>
          <span>Total sales</span>
          <strong>{money(total)}</strong>
        </div>

        <div>
          <span>Received</span>
          <strong className="balance-paid">
            {money(paid)}
          </strong>
        </div>

        <div>
          <span>Outstanding</span>
          <strong className="balance-owing">
            {money(owing)}
          </strong>
        </div>

      </div>

      {/* TRANSACTIONS */}
      <div className="customer-transactions">

        <div className="transactions-heading">

          <div>
            <h4>Transactions</h4>
            <span>
              {transactions.length}{" "}
              {transactions.length === 1
                ? "transaction"
                : "transactions"}
            </span>
          </div>

          <button
            className="add-transaction-button"
            onClick={() =>
              onAddTransaction(customer)
            }
          >
            <i className="fa-solid fa-plus" />
            Add
          </button>

        </div>

        {transactions.length === 0 ? (
          <div className="transaction-empty">
            <i className="fa-regular fa-file-lines" />

            <span>
              No transactions yet
            </span>

            <button
              onClick={() =>
                onAddTransaction(customer)
              }
            >
              Add first transaction
            </button>
          </div>
        ) : (
          <div className="transaction-items">

            {transactions.map((transaction) => {
              const transactionTotal =
                Number(transaction.qty || 0) *
                Number(transaction.price || 0);

              const transactionPaid =
                Math.min(
                  Number(transaction.paid || 0),
                  transactionTotal
                );

              const transactionOwing =
                Math.max(
                  transactionTotal -
                    transactionPaid,
                  0
                );

              const settled =
                transactionOwing === 0 &&
                transactionTotal > 0;

              return (
                <div
                  className="transaction-item"
                  key={transaction.id}
                >

                  <div className="transaction-product">

                    <div className="product-dot">
                      <i className="fa-solid fa-box" />
                    </div>

                    <div>
                      <strong>
                        {transaction.goods ||
                          "Unnamed product"}
                      </strong>

                      <span>
                        {transaction.qty} ×{" "}
                        {money(transaction.price)}
                      </span>
                    </div>

                  </div>

                  <div className="transaction-amount">

                    <strong>
                      {money(transactionTotal)}
                    </strong>

                    <span
                      className={
                        settled
                          ? "transaction-status settled"
                          : "transaction-status owing"
                      }
                    >
                      <i className="fa-solid fa-circle" />

                      {settled
                        ? "Settled"
                        : `${money(
                            transactionOwing
                          )} owing`}
                    </span>

                  </div>

                  <div className="transaction-actions">

                    <button
                      onClick={() =>
                        onEditTransaction(
                          customer,
                          transaction
                        )
                      }
                    >
                      <i className="fa-solid fa-pen" />
                    </button>

                    <button
                      onClick={() =>
                        onDeleteTransaction(
                          customer.id,
                          transaction.id
                        )
                      }
                    >
                      <i className="fa-solid fa-trash" />
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </article>
  );
}

export default CustomerCard;