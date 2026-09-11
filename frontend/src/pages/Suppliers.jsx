import { useMemo, useState, useEffect } from "react";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import ProfileModal from "../components/profile/ProfileModal";
import SupplierCard from "../components/suppliers/SupplierCard";
import PurchaseModal from "../components/suppliers/PurchaseModal";

import "./index.css";
import {
  getSuppliers,
  saveSuppliers,
} from "../api/storage";


// =========================================================
// SUPPLIER FORM MODAL
// =========================================================

function SupplierFormModal({
  open,
  supplier,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    name: supplier?.name || "",
    phone: supplier?.phone || "",
    email: supplier?.email || "",
    address: supplier?.address || "",
  });

  if (!open) return null;

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    onSave({
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    });
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="app-modal modal-medium"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* HEADER */}

        <div className="modal-header">

          <div>
            <h2>
              {supplier
                ? "Edit supplier"
                : "Add supplier"}
            </h2>

            <p>
              {supplier
                ? "Update supplier information."
                : "Add a new supplier to your business."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark" />
          </button>

        </div>


        {/* BODY */}

        <div className="modal-body">

          <form
            className="app-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="form-field">

              <label>
                Supplier name
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  update("name", e.target.value)
                }
                placeholder="Enter supplier name"
                autoFocus
                required
              />

            </div>


            {/* PHONE + EMAIL */}

            <div className="form-row">

              <div className="form-field">

                <label>
                  Phone number
                </label>

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    update("phone", e.target.value)
                  }
                  placeholder="08012345678"
                />

              </div>


              <div className="form-field">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    update("email", e.target.value)
                  }
                  placeholder="supplier@example.com"
                />

              </div>

            </div>


            {/* ADDRESS */}

            <div className="form-field">

              <label>
                Address
              </label>

              <textarea
                rows="3"
                value={form.address}
                onChange={(e) =>
                  update("address", e.target.value)
                }
                placeholder="Enter supplier address"
              />

            </div>


            {/* ACTIONS */}

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
                <i
                  className={
                    supplier
                      ? "fa-solid fa-check"
                      : "fa-solid fa-plus"
                  }
                />

                {supplier
                  ? "Save changes"
                  : "Add supplier"}
              </button>

            </div>

          </form>

        </div>

      </div>
    </div>
  );
}


// =========================================================
// DELETE SUPPLIER MODAL
// =========================================================

function DeleteSupplierModal({
  supplier,
  onClose,
  onConfirm,
}) {
  if (!supplier) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="app-modal modal-small"
        onMouseDown={(e) => e.stopPropagation()}
      >

        <div className="modal-header">

          <div>
            <h2>
              Delete supplier?
            </h2>

            <p>
              This action cannot be undone.
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark" />
          </button>

        </div>


        <div className="modal-body">

          <div className="page-empty">

            <div className="page-empty-icon">
              <i className="fa-solid fa-trash" />
            </div>

            <h3>
              {supplier.name}
            </h3>

            <p>
              All purchases recorded under this
              supplier will also be removed.
            </p>

            <div className="modal-actions">

              <button
                className="secondary-button"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                className="danger-button"
                onClick={onConfirm}
              >
                <i className="fa-solid fa-trash" />
                Delete supplier
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}


// =========================================================
// SUPPLIERS PAGE
// =========================================================

function Suppliers() {

  // =========================================================
  // SUPPLIERS
  // =========================================================

const [suppliers, setSuppliers] = useState(() => getSuppliers());

useEffect(() => {
  saveSuppliers(suppliers);
}, [suppliers]);


  // =========================================================
  // SEARCH
  // =========================================================

  const [search, setSearch] = useState("");


  // =========================================================
  // PROFILE
  // =========================================================

  const [showProfile, setShowProfile] =
    useState(false);


  // =========================================================
  // SUPPLIER MODAL
  // =========================================================

  const [supplierModal, setSupplierModal] =
    useState(false);

  const [editingSupplier, setEditingSupplier] =
    useState(null);


  // =========================================================
  // DELETE
  // =========================================================

  const [deleteSupplier, setDeleteSupplier] =
    useState(null);


  // =========================================================
  // PURCHASE MODAL
  // =========================================================

  const [purchaseModal, setPurchaseModal] =
    useState(false);

  const [purchaseSupplier, setPurchaseSupplier] =
    useState(null);

  const [editingPurchase, setEditingPurchase] =
    useState(null);


  // =========================================================
  // FILTER SUPPLIERS
  // =========================================================

  const filteredSuppliers = useMemo(() => {

    const value =
      search.toLowerCase().trim();

    if (!value) {
      return suppliers;
    }

    return suppliers.filter((supplier) => {

      return (
        supplier.name
          ?.toLowerCase()
          .includes(value) ||

        supplier.phone
          ?.toLowerCase()
          .includes(value) ||

        supplier.email
          ?.toLowerCase()
          .includes(value) ||

        supplier.address
          ?.toLowerCase()
          .includes(value)
      );

    });

  }, [suppliers, search]);


  // =========================================================
  // SUPPLIER STATISTICS
  // =========================================================

  const totals = useMemo(() => {

    let purchases = 0;
    let paid = 0;
    let outstanding = 0;
    let purchaseCount = 0;

    suppliers.forEach((supplier) => {

      const supplierPurchases =
        Array.isArray(supplier.purchases)
          ? supplier.purchases
          : [];

      supplierPurchases.forEach((purchase) => {

        const amount =
          Number(purchase.amount) || 0;

        const amountPaid =
          Math.min(
            Number(purchase.paid) || 0,
            amount
          );

        purchases += amount;
        paid += amountPaid;

        outstanding +=
          Math.max(
            amount - amountPaid,
            0
          );

        purchaseCount++;
      });

    });

    return {
      suppliers: suppliers.length,
      purchases,
      paid,
      outstanding,
      purchaseCount,
    };

  }, [suppliers]);


  // =========================================================
  // MONEY FORMAT
  // =========================================================

  const money = (value) => {

    return `₦${Number(
      value || 0
    ).toLocaleString("en-NG")}`;

  };


  // =========================================================
  // ADD SUPPLIER
  // =========================================================

  const openAddSupplier = () => {

    setEditingSupplier(null);
    setSupplierModal(true);

  };


  // =========================================================
  // EDIT SUPPLIER
  // =========================================================

  const openEditSupplier = (supplier) => {

    setEditingSupplier(supplier);
    setSupplierModal(true);

  };


  // =========================================================
  // SAVE SUPPLIER
  // =========================================================

  const saveSupplier = (data) => {

    if (!data?.name?.trim()) {
      return;
    }

    // EDIT

    if (editingSupplier) {

      setSuppliers((prev) =>
        prev.map((supplier) => {

          if (
            supplier.id !==
            editingSupplier.id
          ) {
            return supplier;
          }

          return {
            ...supplier,
            name: data.name,
            phone: data.phone,
            email: data.email,
            address: data.address,
          };

        })
      );

    }

    // ADD

    else {

      const newSupplier = {

        id:
          typeof crypto !== "undefined" &&
          crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(),

        name: data.name,
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",

        purchases: [],

      };

      setSuppliers((prev) => [
        ...prev,
        newSupplier,
      ]);

    }

    setSupplierModal(false);
    setEditingSupplier(null);

  };


  // =========================================================
  // DELETE SUPPLIER
  // =========================================================

  const confirmDeleteSupplier = () => {

    if (!deleteSupplier) {
      return;
    }

    setSuppliers((prev) =>
      prev.filter(
        (supplier) =>
          supplier.id !==
          deleteSupplier.id
      )
    );

    setDeleteSupplier(null);

  };


  // =========================================================
  // ADD PURCHASE
  // =========================================================

  const openAddPurchase = (supplier) => {

    setPurchaseSupplier(supplier);
    setEditingPurchase(null);
    setPurchaseModal(true);

  };


  // =========================================================
  // EDIT PURCHASE
  // =========================================================

  const openEditPurchase = (
    supplier,
    purchase
  ) => {

    setPurchaseSupplier(supplier);
    setEditingPurchase(purchase);
    setPurchaseModal(true);

  };


  // =========================================================
  // SAVE PURCHASE
  // =========================================================

  const savePurchase = (purchaseData) => {

    if (!purchaseSupplier) {
      return;
    }

    const purchase = {
      ...purchaseData,

      id:
        purchaseData.id ||
        (
          typeof crypto !== "undefined" &&
          crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString()
        ),
    };


    setSuppliers((prev) =>
      prev.map((supplier) => {

        if (
          supplier.id !==
          purchaseSupplier.id
        ) {
          return supplier;
        }

        const purchases =
          Array.isArray(
            supplier.purchases
          )
            ? supplier.purchases
            : [];


        // EDIT PURCHASE

        if (editingPurchase) {

          return {
            ...supplier,

            purchases:
              purchases.map(
                (item) =>
                  item.id ===
                  editingPurchase.id
                    ? purchase
                    : item
              ),
          };

        }


        // ADD PURCHASE

        return {
          ...supplier,

          purchases: [
            ...purchases,
            purchase,
          ],
        };

      })
    );


    setPurchaseModal(false);
    setPurchaseSupplier(null);
    setEditingPurchase(null);

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="expenso-app">

      {/* SIDEBAR */}

      <Sidebar />


      {/* MAIN */}

      <div className="main-content">

        {/* HEADER */}

        <Header
          search={search}
          setSearch={setSearch}
          onProfileClick={() =>
            setShowProfile(true)
          }
        />


        {/* PAGE */}

        <main className="page-container">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="page-header">

            <div>

              <span className="page-kicker">
                BUSINESS MANAGEMENT
              </span>

              <h1>
                Suppliers
              </h1>

              <p>
                Manage your suppliers and track
                purchases and outstanding payments.
              </p>

            </div>


            <button
              className="primary-action"
              onClick={openAddSupplier}
            >
              <i className="fa-solid fa-plus" />
              Add supplier
            </button>

          </section>


          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className="mini-stat-grid">


            {/* SUPPLIERS */}

            <div className="mini-stat">

              <div className="mini-stat-icon red">

                <i className="fa-solid fa-truck" />

              </div>

              <div>

                <span>
                  Total suppliers
                </span>

                <strong>
                  {totals.suppliers}
                </strong>

              </div>

            </div>


            {/* PURCHASES */}

            <div className="mini-stat">

              <div className="mini-stat-icon blue">

                <i className="fa-solid fa-cart-shopping" />

              </div>

              <div>

                <span>
                  Total purchases
                </span>

                <strong>
                  {money(totals.purchases)}
                </strong>

              </div>

            </div>


            {/* PAID */}

            <div className="mini-stat">

              <div className="mini-stat-icon green">

                <i className="fa-solid fa-circle-check" />

              </div>

              <div>

                <span>
                  Amount paid
                </span>

                <strong>
                  {money(totals.paid)}
                </strong>

              </div>

            </div>


            {/* OUTSTANDING */}

            <div className="mini-stat">

              <div className="mini-stat-icon orange">

                <i className="fa-solid fa-clock" />

              </div>

              <div>

                <span>
                  Outstanding
                </span>

                <strong>
                  {money(totals.outstanding)}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              TOOLBAR
          ================================================= */}

          <section className="content-toolbar">

            <div>

              <h2>
                Supplier accounts
              </h2>

              <span>
                {filteredSuppliers.length} supplier
                {filteredSuppliers.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </span>

            </div>


            <div className="page-search">

              <i className="fa-solid fa-search" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search suppliers..."
              />


              {search && (

                <button
                  onClick={() =>
                    setSearch("")
                  }
                  type="button"
                >
                  <i className="fa-solid fa-xmark" />
                </button>

              )}

            </div>

          </section>


          {/* =================================================
              SUPPLIER GRID
          ================================================= */}

          {filteredSuppliers.length > 0 ? (
              <section className="customerd">
            <section className="customer">

              {filteredSuppliers.map(
                (supplier) => (

                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    onEdit={openEditSupplier}
                    onDelete={setDeleteSupplier}
                    onAddPurchase={
                      openAddPurchase
                    }
                    onEditPurchase={
                      openEditPurchase
                    }
                  />

                )
              )}

            </section>
            </section>

          ) : (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <section className="page-empty">

              <div className="page-empty-icon">

                <i className="fa-solid fa-truck" />

              </div>

              <h3>
                {search
                  ? "No suppliers found"
                  : "No suppliers yet"}
              </h3>

              <p>
                {search
                  ? `No supplier matches "${search}".`
                  : "Add your first supplier to start tracking purchases and payments."}
              </p>


              {search ? (

                <button
                  className="secondary-button"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  Clear search
                </button>

              ) : (

                <button
                  className="primary-button"
                  onClick={openAddSupplier}
                >
                  <i className="fa-solid fa-plus" />
                  Add supplier
                </button>

              )}

            </section>

          )}

        </main>

      </div>


      {/* =====================================================
          SUPPLIER FORM
      ===================================================== */}

      <SupplierFormModal
        open={supplierModal}
        supplier={editingSupplier}
        onClose={() => {

          setSupplierModal(false);
          setEditingSupplier(null);

        }}
        onSave={saveSupplier}
      />


      {/* =====================================================
          PURCHASE MODAL
      ===================================================== */}

      <PurchaseModal
        open={purchaseModal}
        supplier={purchaseSupplier}
        purchase={editingPurchase}
        onClose={() => {

          setPurchaseModal(false);
          setPurchaseSupplier(null);
          setEditingPurchase(null);

        }}
        onSave={savePurchase}
      />


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      <DeleteSupplierModal
        supplier={deleteSupplier}
        onClose={() =>
          setDeleteSupplier(null)
        }
        onConfirm={
          confirmDeleteSupplier
        }
      />


      {/* =====================================================
          PROFILE
      ===================================================== */}

      {showProfile && (

        <ProfileModal
          onClose={() =>
            setShowProfile(false)
          }
        />

      )}

    </div>
  );
}

export default Suppliers;