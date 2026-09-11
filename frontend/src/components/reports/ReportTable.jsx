function ReportTable({
  title,
  subtitle,
  rows,
  type,
}) {
  const money = (value) =>
    `₦${Number(value || 0).toLocaleString(
      "en-NG"
    )}`;

  const downloadCSV = () => {
    if (!rows.length) return;

    let headers = [];

    if (type === "customers") {
      headers = [
        "Date",
        "Customer",
        "Goods",
        "Quantity",
        "Price",
        "Paid",
        "Unpaid",
        "Status",
      ];
    } else {
      headers = [
        "Date",
        "Supplier",
        "Goods",
        "Amount",
        "Paid",
        "Outstanding",
        "Status",
      ];
    }

    const data = rows.map((row) => {
      if (type === "customers") {
        return [
          row.date,
          row.customer,
          row.goods,
          row.qty,
          row.price,
          row.paid,
          row.unpaid,
          row.status,
        ];
      }

      return [
        row.date,
        row.supplier,
        row.goods,
        row.amount,
        row.paid,
        row.outstanding,
        row.status,
      ];
    });

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(
        /"/g,
        '""'
      )}"`;

    const csv = [
      headers,
      ...data,
    ]
      .map((row) =>
        row.map(escapeCSV).join(",")
      )
      .join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      type === "customers"
        ? "expenso-customer-report.csv"
        : "expenso-supplier-report.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="report-card">

      <div className="report-card-header">

        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <button
          className="export-button"
          onClick={downloadCSV}
          disabled={!rows.length}
        >
          <i className="fa-solid fa-download" />
          Export CSV
        </button>

      </div>

      {rows.length === 0 ? (
        <div className="report-empty">
          <i className="fa-regular fa-file-lines" />
          <span>
            No records found for this period.
          </span>
        </div>
      ) : (
        <div className="report-table-wrapper">

          <table className="report-table">

            <thead>
              <tr>
                {type === "customers" ? (
                  <>
                    <th>DATE</th>
                    <th>CUSTOMER</th>
                    <th>GOODS</th>
                    <th>QTY</th>
                    <th>PRICE</th>
                    <th>PAID</th>
                    <th>UNPAID</th>
                    <th>STATUS</th>
                  </>
                ) : (
                  <>
                    <th>DATE</th>
                    <th>SUPPLIER</th>
                    <th>GOODS</th>
                    <th>AMOUNT</th>
                    <th>PAID</th>
                    <th>OUTSTANDING</th>
                    <th>STATUS</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>

              {rows.map((row, index) => (
                <tr key={index}>

                  <td>{row.date}</td>

                  <td>
                    {type === "customers"
                      ? row.customer
                      : row.supplier}
                  </td>

                  <td>{row.goods}</td>

                  {type === "customers" ? (
                    <>
                      <td>{row.qty}</td>
                      <td>
                        {money(row.price)}
                      </td>
                      <td className="report-paid">
                        {money(row.paid)}
                      </td>
                      <td className="report-owing">
                        {money(row.unpaid)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        {money(row.amount)}
                      </td>
                      <td className="report-paid">
                        {money(row.paid)}
                      </td>
                      <td className="report-owing">
                        {money(row.outstanding)}
                      </td>
                    </>
                  )}

                  <td>
                    <span
                      className={
                        row.status ===
                        "Settled"
                          ? "table-status settled"
                          : "table-status owing"
                      }
                    >
                      {row.status}
                    </span>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}

    </section>
  );
}

export default ReportTable;