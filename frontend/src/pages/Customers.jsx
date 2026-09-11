import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import CustomerCard from "../components/customers/CustomerCard";
import CustomerFormModal from "../components/customers/CustomerFormModal";
import TransactionModal from "../components/customers/TransactionModal";
import DeleteCustomerModal from "../components/customers/DeleteCustomerModal";
import Toast from "../components/common/Toast";

import {
  createId,
  getCustomers,
  saveCustomers,
} from "../api/storage";

import "./index.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const [customerModal, setCustomerModal] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState(null);

  const [transactionModal, setTransactionModal] =
    useState(false);

  const [transactionCustomer, setTransactionCustomer] =
    useState(null);

  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [deleteCustomer, setDeleteCustomer] =
    useState(null);

  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const persist = (next) => {
    setCustomers(next);
    saveCustomers(next);
  };

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      message,
      type,
    });
  };

  /* ================================
     FILTER
  ================================= */

  const filteredCustomers = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    if (!query) return customers;

    return customers.filter((customer) => {
      const name =
        customer.name?.toLowerCase() || "";

      const email =
        customer.email?.toLowerCase() || "";

      const phone =
        customer.phone?.toLowerCase() || "";

      const transactionText =
        customer.transactions
          ?.map((transaction) =>
            transaction.goods
              ?.toLowerCase()
          )
          .join(" ") || "";

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        transactionText.includes(query)
      );
    });
  }, [customers, search]);

  /* ================================
     CUSTOMER
  ================================= */

  const openAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerModal(true);
  };

  const openEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setCustomerModal(true);
  };

  const saveCustomer = (data) => {
    if (editingCustomer) {
      const next = customers.map(
        (customer) =>
          customer.id === editingCustomer.id
            ? {
                ...customer,
                ...data,
              }
            : customer
      );

      persist(next);

      showToast(
        "Customer information updated."
      );
    } else {
      const next = [
        {
          id: createId(),
          ...data,
          transactions: [],
        },
        ...customers,
      ];

      persist(next);

      showToast(
        "Customer created successfully."
      );
    }

    setCustomerModal(false);
    setEditingCustomer(null);
  };

  const confirmDeleteCustomer = () => {
    if (!deleteCustomer) return;

    const next = customers.filter(
      (customer) =>
        customer.id !== deleteCustomer.id
    );

    persist(next);

    setDeleteCustomer(null);

    showToast(
      "Customer deleted successfully.",
      "success"
    );
  };

  /* ================================
     TRANSACTIONS
  ================================= */

  const openAddTransaction = (customer) => {
    setTransactionCustomer(customer);
    setEditingTransaction(null);
    setTransactionModal(true);
  };

  const openEditTransaction = (
    customer,
    transaction
  ) => {
    setTransactionCustomer(customer);
    setEditingTransaction(transaction);
    setTransactionModal(true);
  };

  const saveTransaction = (transaction) => {
    if (!transactionCustomer) return;

    const customerId =
      transactionCustomer.id;

    const next = customers.map(
      (customer) => {
        if (customer.id !== customerId) {
          return customer;
        }

        let transactions = Array.isArray(
          customer.transactions
        )
          ? [...customer.transactions]
          : [];

        if (editingTransaction) {
          transactions =
            transactions.map(
              (item) =>
                item.id ===
                editingTransaction.id
                  ? {
                      ...item,
                      ...transaction,
                    }
                  : item
            );
        } else {
          transactions.push({
            id: createId(),
            ...transaction,
          });
        }

        return {
          ...customer,
          transactions,
        };
      }
    );

    persist(next);

    setTransactionModal(false);
    setTransactionCustomer(null);
    setEditingTransaction(null);

    showToast(
      editingTransaction
        ? "Transaction updated."
        : "Transaction added."
    );
  };

  const deleteTransaction = (
    customerId,
    transactionId
  ) => {
    const next = customers.map(
      (customer) => {
        if (customer.id !== customerId) {
          return customer;
        }

        return {
          ...customer,
          transactions:
            customer.transactions.filter(
              (transaction) =>
                transaction.id !==
                transactionId
            ),
        };
      }
    );

    persist(next);

    showToast(
      "Transaction deleted."
    );
  };

  /* ================================
     STATISTICS
  ================================= */

  const statistics = useMemo(() => {
    let sales = 0;
    let paid = 0;
    let owing = 0;

    customers.forEach((customer) => {
      customer.transactions?.forEach(
        (transaction) => {
          const total =
            Number(transaction.qty || 0) *
            Number(transaction.price || 0);

          const actualPaid =
            Math.min(
              Number(transaction.paid || 0),
              total
            );

          sales += total;
          paid += actualPaid;
          owing += Math.max(
            total - actualPaid,
            0
          );
        }
      );
    });

    return {
      sales,
      paid,
      owing,
    };
  }, [customers]);

  const money = (value) =>
    `₦${Number(value || 0).toLocaleString(
      "en-NG"
    )}`;

  return (
    <div className="expenso-app">

      <Sidebar />

      <div className="main-content">

        <Header
          search={search}
          setSearch={setSearch}
        />

        <main className="page-container">

          {/* PAGE HEADER */}
          <section className="page-header">

            <div>
              <span className="page-kicker">
                ACCOUNT MANAGEMENT
              </span>

              <h1>Customers</h1>

              <p>
                Manage customer accounts,
                transactions and outstanding
                payments.
              </p>
            </div>

            <button
              className="primary-action"
              onClick={openAddCustomer}
            >
              <i className="fa-solid fa-plus" />
              Add customer
            </button>

          </section>

          {/* STATS */}
          <section className="mini-stat-grid">

            <div className="mini-stat">
              <div className="mini-stat-icon red">
                <i className="fa-solid fa-users" />
              </div>

              <div>
                <span>Total customers</span>
                <strong>
                  {customers.length}
                </strong>
              </div>
            </div>

            <div className="mini-stat">
              <div className="mini-stat-icon blue">
                <i className="fa-solid fa-chart-line" />
              </div>

              <div>
                <span>Total sales</span>
                <strong>
                  {money(statistics.sales)}
                </strong>
              </div>
            </div>

            <div className="mini-stat">
              <div className="mini-stat-icon green">
                <i className="fa-solid fa-circle-check" />
              </div>

              <div>
                <span>Received</span>
                <strong>
                  {money(statistics.paid)}
                </strong>
              </div>
            </div>

            <div className="mini-stat">
              <div className="mini-stat-icon orange">
                <i className="fa-solid fa-clock" />
              </div>

              <div>
                <span>Outstanding</span>
                <strong>
                  {money(statistics.owing)}
                </strong>
              </div>
            </div>

          </section>

          {/* TOOLBAR */}
          <section className="content-toolbar">

            <div>
              <h2>
                Customer accounts
              </h2>

              <span>
                {filteredCustomers.length}{" "}
                customer
                {filteredCustomers.length !==
                1
                  ? "s"
                  : ""}
              </span>
            </div>

            <div className="page-search">

              <i className="fa-solid fa-search" />

              <input
                placeholder="Search customers..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}

            </div>

          </section>

          {/* CUSTOMER GRID */}
          {filteredCustomers.length === 0 ? (
            <div className="page-empty">

              <div className="page-empty-icon">
                <i className="fa-solid fa-users" />
              </div>

              <h3>
                {search
                  ? "No customers found"
                  : "No customers yet"}
              </h3>

              <p>
                {search
                  ? "Try another search."
                  : "Create your first customer account to get started."}
              </p>

              {!search && (
                <button
                  className="primary-action"
                  onClick={openAddCustomer}
                >
                  <i className="fa-solid fa-plus" />
                  Add customer
                </button>
              )}

            </div>
          ) : (
            <div className="customer">

              {filteredCustomers.map(
                (customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onEdit={openEditCustomer}
                    onDelete={setDeleteCustomer}
                    onAddTransaction={
                      openAddTransaction
                    }
                    onEditTransaction={
                      openEditTransaction
                    }
                    onDeleteTransaction={
                      deleteTransaction
                    }
                  />
                )
              )}

            </div>
          )}

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
        onCancel={() =>
          setDeleteCustomer(null)
        }
        onConfirm={
          confirmDeleteCustomer
        }
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast({
            message: "",
            type: "success",
          })
        }
      />

    </div>
  );
}

export default Customers;