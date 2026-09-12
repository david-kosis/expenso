import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import ReportTable from "../components/reports/ReportTable";

import { getCustomers, getSuppliers } from "../api/storage";
import "./index.css";

function Reports() {
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [period, setPeriod] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refreshReports = () => {
      setCustomers(getCustomers());
      setSuppliers(getSuppliers());
    };

    refreshReports();

    window.addEventListener("expenso-data-changed", refreshReports);
    window.addEventListener("storage", refreshReports);

    return () => {
      window.removeEventListener("expenso-data-changed", refreshReports);
      window.removeEventListener("storage", refreshReports);
    };
  }, []);

  const dateAllowed = (date) => {
    if (period === "all") return true;
    if (!date) return false;

    const current = new Date();
    const target = new Date(date);

    if (Number.isNaN(target.getTime())) return false;

    if (period === "today") {
      return target.toDateString() === current.toDateString();
    }

    if (period === "week") {
      const start = new Date(current);
      start.setDate(current.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return target >= start;
    }

    if (period === "month") {
      return (
        target.getMonth() === current.getMonth() &&
        target.getFullYear() === current.getFullYear()
      );
    }

    if (period === "year") {
      return target.getFullYear() === current.getFullYear();
    }

    return true;
  };

  const query = search.toLowerCase().trim();

  const customerRows = useMemo(() => {
    const rows = [];

    customers.forEach((customer) => {
      const transactions = Array.isArray(customer.transactions)
        ? customer.transactions
        : [];

      transactions.forEach((transaction) => {
        if (!dateAllowed(transaction.date)) return;

        const qty = Number(transaction.qty) || 0;
        const price = Number(transaction.price) || 0;
        const total = qty * price;
        const paid = Math.min(Number(transaction.paid) || 0, total);
        const unpaid = Math.max(total - paid, 0);

        const row = {
          id: transaction.id,
          date: transaction.date,
          customer: customer.name || "Unnamed customer",
          goods: transaction.goods || "—",
          qty,
          price,
          paid,
          unpaid,
          status: unpaid === 0 && total > 0 ? "Settled" : "Owing",
        };

        if (!query) {
          rows.push(row);
          return;
        }

        const searchable = [
          row.customer,
          row.goods,
          row.status,
          row.date,
        ].filter(Boolean).join(" ").toLowerCase();

        if (searchable.includes(query)) rows.push(row);
      });
    });

    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [customers, period, query]);

  const supplierRows = useMemo(() => {
    const rows = [];

    suppliers.forEach((supplier) => {
      const purchases = Array.isArray(supplier.purchases)
        ? supplier.purchases
        : [];

      purchases.forEach((purchase) => {
        if (!dateAllowed(purchase.date)) return;

        const amount = Number(purchase.amount) || 0;
        const paid = Math.min(Number(purchase.paid) || 0, amount);
        const outstanding = Math.max(amount - paid, 0);

        const row = {
          id: purchase.id,
          date: purchase.date,
          supplier: supplier.name || "Unnamed supplier",
          goods: purchase.goods || "—",
          amount,
          paid,
          outstanding,
          status: outstanding === 0 && amount > 0 ? "Settled" : "Owing",
        };

        if (!query) {
          rows.push(row);
          return;
        }

        const searchable = [
          row.supplier,
          row.goods,
          row.status,
          row.date,
        ].filter(Boolean).join(" ").toLowerCase();

        if (searchable.includes(query)) rows.push(row);
      });
    });

    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [suppliers, period, query]);

  const customerTotal = customerRows.reduce((sum, row) => sum + row.qty * row.price, 0);
  const customerPaid = customerRows.reduce((sum, row) => sum + row.paid, 0);
  const customerOwing = customerRows.reduce((sum, row) => sum + row.unpaid, 0);
  const supplierTotal = supplierRows.reduce((sum, row) => sum + row.amount, 0);
  const supplierPaid = supplierRows.reduce((sum, row) => sum + row.paid, 0);
  const supplierOwing = supplierRows.reduce((sum, row) => sum + row.outstanding, 0);

  const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG")}`;

  return (
    <div className="expenso-app">
      <Sidebar />

      <div className="main-content">
        <Header search={search} setSearch={setSearch} />

        <main className="page-container">
          <section className="page-header">
            <div>
              <span className="page-kicker">BUSINESS ANALYTICS</span>
              <h1>Reports</h1>
              <p>Understand your sales, payments and supplier spending.</p>
            </div>
          </section>

          <div className="report-period">
            <span>Report period</span>
            <div className="period-buttons">
              {[
                ["all", "All time"],
                ["today", "Today"],
                ["week", "Last 7 days"],
                ["month", "This month"],
                ["year", "This year"],
              ].map(([value, label]) => (
                <button key={value} className={period === value ? "active" : ""} onClick={() => setPeriod(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <section className="report-summary-grid">
            <div className="report-summary-card">
              <span>Customer sales</span>
              <strong>{money(customerTotal)}</strong>
              <small>{customerRows.length} transactions</small>
            </div>
            <div className="report-summary-card">
              <span>Customer payments</span>
              <strong className="summary-green">{money(customerPaid)}</strong>
              <small>Money received</small>
            </div>
            <div className="report-summary-card">
              <span>Customer outstanding</span>
              <strong className="summary-red">{money(customerOwing)}</strong>
              <small>Money still owed</small>
            </div>
            <div className="report-summary-card">
              <span>Supplier spending</span>
              <strong>{money(supplierTotal)}</strong>
              <small>{supplierRows.length} purchases</small>
            </div>
          </section>

          <ReportTable
            title="Customer transactions"
            subtitle="Live sales, payments and outstanding balances from the Customers page."
            rows={customerRows}
            type="customers"
          />

          <ReportTable
            title="Supplier activity"
            subtitle="Live purchases and payments from the Suppliers page."
            rows={supplierRows}
            type="suppliers"
          />

          <section className="report-bottom-summary">
            <div>
              <span>Supplier paid</span>
              <strong>{money(supplierPaid)}</strong>
            </div>
            <div>
              <span>Supplier outstanding</span>
              <strong className="summary-red">{money(supplierOwing)}</strong>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Reports;
