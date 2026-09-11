function Statistics({ totals }) {
  const formatMoney = (amount) =>
    `₦${Number(amount || 0).toLocaleString("en-NG")}`;

  const cards = [
    {
      title: "Total sales",
      value: formatMoney(totals.sales),
      description: "Total value of transactions",
      icon: "fa-chart-line",
      className: "sales",
    },
    {
      title: "Amount received",
      value: formatMoney(totals.paid),
      description: "Payments received",
      icon: "fa-circle-check",
      className: "paid",
    },
    {
      title: "Outstanding",
      value: formatMoney(totals.outstanding),
      description: "Money customers owe",
      icon: "fa-clock",
      className: "outstanding",
    },
    {
      title: "Customers",
      value: totals.customers,
      description: "Active customer accounts",
      icon: "fa-users",
      className: "customers",
    },
  ];

  return (
    <section className="statistics-grid">
      {cards.map((card) => (
        <div className="stat-card" key={card.title}>
          <div className={`stat-icon ${card.className}`}>
            <i className={`fa-solid ${card.icon}`}></i>
          </div>

          <div className="stat-content">
            <span>{card.title}</span>

            <strong>{card.value}</strong>

            <small>{card.description}</small>
          </div>
        </div>
      ))}
    </section>
  );
}

export default Statistics;