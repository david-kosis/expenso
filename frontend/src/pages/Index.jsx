import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Statistics from "../components/dashboard/Statistics";
import CustomerCard from "../components/customers/CustomerCard";
import CustomerFormModal from "../components/customers/CustomerFormModal";
import TransactionModal from "../components/customers/TransactionModal";
import DeleteCustomerModal from "../components/customers/DeleteCustomerModal";
import ProfileModal from "../components/profile/ProfileModal";
import Toast from "../components/common/Toast";

import {
  createId,
  getCustomers,
  saveCustomers,
} from "../api/storage";

import "./index.css";

function Index() {
  const navigate = useNavigate();

  // No dummy data. Customers are loaded from localStorage.
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const [customerModal, setCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [transactionModal, setTransactionModal] = useState(false);
  const [transactionCustomer, setTransactionCustomer] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const persistCustomers = (nextCustomers) => {
    setCustomers(nextCustomers);
    saveCustomers(nextCustomers);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return customers;

    return customers.filter((customer) => {
      const name = customer.name?.toLowerCase() || "";
      const email = customer.email?.toLowerCase() || "";
      const phone = customer.phone?.toLowerCase() || "";
      const goods = (customer.transactions || [])
        .map((transaction) => transaction.goods?.toLowerCase() || "")
        .join(" ");

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        goods.includes(query)
      );
    });
  }, [customers, search]);

  const totals = useMemo(() => {
    let sales = 0;
    let paid = 0;

    customers.forEach((customer) => {
      (customer.transactions || []).forEach((transaction) => {
        const total =
          (Number(transaction.qty) || 0) *
          (Number(transaction.price) || 0);

        const amountPaid = Math.min(
          Number(transaction.paid) || 0,
          total
        );

        sales += total;
        paid += amountPaid;
      });
    });

    return {
      sales,
      paid,
      outstanding: Math.max(sales - paid, 0),
      customers: customers.length,
    };
  }, [customers]);

  const openAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerModal(true);
  };

  const openEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setCustomerModal(true);
  };

  const saveCustomer = (data) => {
    const name = data?.name?.trim();
    if (!name) return;

    if (editingCustomer) {
      const next = customers.map((customer) =>
        customer.id === editingCustomer.id
          ? {
              ...customer,
              name,
              phone: data.phone || "",
              email: data.email || "",
              address: data.address || "",
            }
          : customer
      );

      persistCustomers(next);
      showToast("Customer information updated.");
    } else {
      const next = [
        {
          id: createId(),
          name,
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          transactions: [],
        },
        ...customers,
      ];

      persistCustomers(next);
      showToast("Customer created successfully.");
    }

    setCustomerModal(false);
    setEditingCustomer(null);
  };

  const openAddTransaction = (customer) => {
    setTransactionCustomer(customer);
    setEditingTransaction(null);
    setTransactionModal(true);
  };

  const openEditTransaction = (customer, transaction) => {
    setTransactionCustomer(customer);
    setEditingTransaction(transaction);
    setTransactionModal(true);
  };

  const saveTransaction = (data) => {
    if (!transactionCustomer) return;

    const next = customers.map((customer) => {
      if (customer.id !== transactionCustomer.id) return customer;

      const transactions = Array.isArray(customer.transactions)
        ? [...customer.transactions]
        : [];

      if (editingTransaction) {
        return {
          ...customer,
          transactions: transactions.map((transaction) =>
            transaction.id === editingTransaction.id
              ? { ...transaction, ...data }
              : transaction
          ),
        };
      }

      return {
        ...customer,
        transactions: [
          ...transactions,
          { id: createId(), ...data },
        ],
      };
    });

    persistCustomers(next);
    showToast(
      editingTransaction
        ? "Transaction updated."
        : "Transaction added."
    );

    setTransactionModal(false);
    setTransactionCustomer(null);
    setEditingTransaction(null);
  };

  const deleteTransaction = (customerId, transactionId) => {
    const next = customers.map((customer) => {
      if (customer.id !== customerId) return customer;

      return {
        ...customer,
        transactions: (customer.transactions || []).filter(
          (transaction) => transaction.id !== transactionId
        ),
      };
    });

    persistCustomers(next);
    showToast("Transaction deleted.");
  };

  const confirmDeleteCustomer = () => {
    if (!deleteCustomer) return;

    const next = customers.filter(
      (customer) => customer.id !== deleteCustomer.id
    );

    persistCustomers(next);
    setDeleteCustomer(null);
    showToast("Customer deleted successfully.");
  };

  return (
    <div className="expenso-app">
      <Sidebar />

      <div className="main-content">
        <Header
          search={search}
          setSearch={setSearch}
          onProfileClick={() => setShowProfile(true)}
        />

        <main className="page-container">
          <section className="page-header">
            <div>
              <span className="page-kicker">BUSINESS OVERVIEW</span>
              <h1>Good day 👋</h1>
              <p>Here's what's happening with your business today.</p>
            </div>

            <div className="hero-actions">
              <button
                className="secondary-button"
                onClick={() => navigate("/reports")}
              >
                <i className="fa-solid fa-chart-column" />
                View reports
              </button>

              <button
                className="primary-button"
                onClick={openAddCustomer}
              >
                <i className="fa-solid fa-plus" />
                Add customer
              </button>
            </div>
          </section>

          <Statistics totals={totals} />

          <section className="quick-actions">
            <div className="section-heading">
              <div>
                <h2>Quick actions</h2>
                <p>Common things you may want to do.</p>
              </div>
            </div>

            <div className="quick-action-grid">
              <button className="quick-action" onClick={openAddCustomer}>
                <div className="quick-icon red">
                  <i className="fa-solid fa-user-plus" />
                </div>
                <div>
                  <strong>Add customer</strong>
                  <span>Create a new customer account</span>
                </div>
                <i className="fa-solid fa-chevron-right arrow" />
              </button>

              <button
                className="quick-action"
                onClick={() => navigate("/suppliers")}
              >
                <div className="quick-icon blue">
                  <i className="fa-solid fa-truck" />
                </div>
                <div>
                  <strong>Manage suppliers</strong>
                  <span>View suppliers and purchases</span>
                </div>
                <i className="fa-solid fa-chevron-right arrow" />
              </button>

              <button
                className="quick-action"
                onClick={() => navigate("/products")}
              >
                <div className="quick-icon green">
                  <i className="fa-solid fa-box" />
                </div>
                <div>
                  <strong>Inventory</strong>
                  <span>Manage your products</span>
                </div>
                <i className="fa-solid fa-chevron-right arrow" />
              </button>

              <button
                className="quick-action"
                onClick={() => navigate("/reports")}
              >
                <div className="quick-icon purple">
                  <i className="fa-solid fa-file-lines" />
                </div>
                <div>
                  <strong>View reports</strong>
                  <span>Analyse business performance</span>
                </div>
                <i className="fa-solid fa-chevron-right arrow" />
              </button>
            </div>
          </section>

          <section className="customers-section">
            <div className="section-heading">
              <div>
                <h2>Customer accounts</h2>
                <p>Recent customer activity and outstanding balances.</p>
              </div>

              <button
                className="view-all-btn"
                onClick={() => navigate("/customers")}
              >
                View all
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="page-empty">
                <div className="page-empty-icon">
                  <i className="fa-solid fa-users" />
                </div>
                <h3>
                  {search ? "No customers found" : "No customer accounts"}
                </h3>
                <p>
                  {search
                    ? "Try another search."
                    : "Add a customer to begin tracking transactions."}
                </p>
                {!search && (
                  <button className="primary-button" onClick={openAddCustomer}>
                    <i className="fa-solid fa-plus" />
                    Add customer
                  </button>
                )}
              </div>
            ) : (
              <div className="customer">
                {filteredCustomers.slice(0, 4).map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onEdit={openEditCustomer}
                    onDelete={setDeleteCustomer}
                    onAddTransaction={openAddTransaction}
                    onEditTransaction={openEditTransaction}
                    onDeleteTransaction={deleteTransaction}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <CustomerFormModal
        open={customerModal}
        customer={editingCustomer}
        onClose={() => {
          setCustomerModal(false);
          setEditingCustomer(null);
        }}
        onSave={saveCustomer}
      />

      <TransactionModal
        open={transactionModal}
        customer={transactionCustomer}
        transaction={editingTransaction}
        onClose={() => {
          setTransactionModal(false);
          setTransactionCustomer(null);
          setEditingTransaction(null);
        }}
        onSave={saveTransaction}
      />

      <DeleteCustomerModal
        customer={deleteCustomer}
        onCancel={() => setDeleteCustomer(null)}
        onConfirm={confirmDeleteCustomer}
      />

      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
}

export default Index;
