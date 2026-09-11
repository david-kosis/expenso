import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

import ProductCard from "../components/products/ProductCard";
import ProductFormModal from "../components/products/ProductFormModal";
import Modal from "../components/common/Modal";

import {
  createId,
  getProducts,
  saveProducts,
  addNotification,
} from "../api/storage";

import "./index.css";

function Products() {

  // =========================================================
  // PRODUCTS
  // =========================================================

  const [products, setProducts] =
  useState(() => {
    return getProducts();
  });


  // =========================================================
  // SEARCH
  // =========================================================

  const [search, setSearch] = useState("");


  // =========================================================
  // MODALS
  // =========================================================

  const [showModal, setShowModal] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [deleteProduct, setDeleteProduct] =
    useState(null);


  // =========================================================
  // SAVE PRODUCTS
  // =========================================================

  useEffect(() => {
  saveProducts(products);
}, [products]);


  // =========================================================
  // SEARCH PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {

    const value =
      search.toLowerCase().trim();

    if (!value) {
      return products;
    }

    return products.filter((product) => {

      return (
        product.name
          ?.toLowerCase()
          .includes(value) ||

        product.category
          ?.toLowerCase()
          .includes(value)
      );

    });

  }, [products, search]);


  // =========================================================
  // ADD PRODUCT
  // =========================================================

  const openAddProduct = () => {

    setEditingProduct(null);
    setShowModal(true);

  };


  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  const openEditProduct = (product) => {

    setEditingProduct(product);
    setShowModal(true);

  };


  // =========================================================
  // SAVE PRODUCT
  // =========================================================

  const saveProduct = (formData) => {

  const name =
    formData?.name?.trim();

  if (!name) {
    return;
  }


  /* =========================================
     UPDATE PRODUCT
  ========================================== */

  if (editingProduct) {

    const updatedProduct = {
      ...editingProduct,

      name,

      category:
        formData.category?.trim() ||
        "General",

      costPrice:
        Number(
          formData.costPrice
        ) || 0,

      sellingPrice:
        Number(
          formData.sellingPrice
        ) || 0,

      stock:
        Number(
          formData.stock
        ) || 0,

      lowStockThreshold:
        Number(
          formData.lowStockThreshold
        ) || 5,

      updatedAt:
        new Date().toISOString(),
    };


    setProducts(
      (previousProducts) =>
        previousProducts.map(
          (product) =>
            product.id ===
            editingProduct.id
              ? updatedProduct
              : product
        )
    );


    addNotification({
      title:
        "Product updated",

      message:
        `${name} was updated successfully.`,

      type:
        "success",
    });

  }


  /* =========================================
     CREATE PRODUCT
  ========================================== */

  else {

    const newProduct = {

      id: createId(),

      name,

      category:
        formData.category?.trim() ||
        "General",

      costPrice:
        Number(
          formData.costPrice
        ) || 0,

      sellingPrice:
        Number(
          formData.sellingPrice
        ) || 0,

      stock:
        Number(
          formData.stock
        ) || 0,

      lowStockThreshold:
        Number(
          formData.lowStockThreshold
        ) || 5,

      createdAt:
        new Date().toISOString(),

    };


    setProducts(
      (previousProducts) => [
        newProduct,
        ...previousProducts,
      ]
    );


    addNotification({
      title:
        "Product added",

      message:
        `${name} was added to your inventory successfully.`,

      type:
        "success",
    });

  }


  setShowModal(false);

  setEditingProduct(null);
};


  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const confirmDelete = () => {

  if (!deleteProduct) {
    return;
  }

  const productName =
    deleteProduct.name ||
    "Product";


  setProducts(
    (previousProducts) =>
      previousProducts.filter(
        (product) =>
          product.id !==
          deleteProduct.id
      )
  );


  addNotification({
    title:
      "Product deleted",

    message:
      `${productName} was removed from your inventory.`,

    type:
      "warning",
  });


  setDeleteProduct(null);
};


  // =========================================================
  // STATISTICS
  // =========================================================

  const totalStock = products.reduce(

    (total, product) =>

      total +
      Number(product.stock || 0),

    0

  );


  const lowStock = products.filter((product) => {

    const stock =
      Number(product.stock || 0);

    const threshold =
      Number(
        product.lowStockThreshold || 5
      );

    return stock <= threshold;

  }).length;


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="expenso-app">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="main-content">


        {/* ===================================================
            HEADER
        =================================================== */}

        <Header
          search={search}
          setSearch={setSearch}
        />


        {/* ===================================================
            PAGE
        =================================================== */}

        <main className="dashboard-page">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="page-top">

            <div>

              <span className="dashboard-label">
                INVENTORY
              </span>

              <h1>
                Products
              </h1>

              <p>
                Manage the products and items
                your business sells.
              </p>

            </div>


            <button
              className="primary-action"
              onClick={openAddProduct}
            >

              <i className="fa-solid fa-plus"></i>

              Add product

            </button>

          </section>


          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="summary-grid">


            {/* =================================================
                TOTAL PRODUCTS
            ================================================= */}

            <div className="summary-card">

              <div className="summary-icon red">

                <i className="fa-solid fa-box"></i>

              </div>


              <div>

                <span>
                  Total products
                </span>

                <strong>
                  {products.length}
                </strong>

              </div>

            </div>


            {/* =================================================
                TOTAL STOCK
            ================================================= */}

            <div className="summary-card">

              <div className="summary-icon blue">

                <i className="fa-solid fa-layer-group"></i>

              </div>


              <div>

                <span>
                  Items in stock
                </span>

                <strong>
                  {totalStock}
                </strong>

              </div>

            </div>


            {/* =================================================
                LOW STOCK
            ================================================= */}

            <div className="summary-card">

              <div className="summary-icon orange">

                <i className="fa-solid fa-triangle-exclamation"></i>

              </div>


              <div>

                <span>
                  Low stock
                </span>

                <strong>
                  {lowStock}
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              PRODUCT CATALOGUE
          ================================================= */}

          <section className="content-card">


            {/* =================================================
                CATALOGUE HEADER
            ================================================= */}

            <div className="content-card-header">

              <div>

                <h2>
                  Product catalogue
                </h2>

                <p>
                  Everything currently available
                  for sale.
                </p>

              </div>


              {/* =================================================
                  SEARCH
              ================================================= */}

              <div className="table-search">

                <i className="fa-solid fa-search"></i>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search products..."
                />

              </div>

            </div>


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {filteredProducts.length === 0 ? (

              <div className="page-empty">


                <div className="page-empty-icon">

                  <i className="fa-solid fa-box-open"></i>

                </div>


                <h3>

                  {search
                    ? "No products found"
                    : "No products yet"}

                </h3>


                <p>

                  {search

                    ? "Try searching for another product or category."

                    : "Add the products your business sells to start managing your inventory."}

                </p>


                {!search && (

                  <button
                    className="primary-action"
                    onClick={openAddProduct}
                  >

                    <i className="fa-solid fa-plus"></i>

                    Add first product

                  </button>

                )}

              </div>

            ) : (


              /* =================================================
                 PRODUCT TABLE
              ================================================= */

              <div className="responsive-table">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Product
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        Cost price
                      </th>

                      <th>
                        Selling price
                      </th>

                      <th>
                        Stock
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredProducts.map(
                      (product) => {

                        const stock =
                          Number(
                            product.stock
                          ) || 0;


                        const threshold =
                          Number(
                            product.lowStockThreshold
                          ) || 5;


                        const isOutOfStock =
                          stock === 0;


                        const isLowStock =
                          stock > 0 &&
                          stock <= threshold;


                        return (

                          <tr
                            key={product.id}
                          >


                            {/* PRODUCT */}

                            <td>

                              <div className="product-name-cell">

                                <div className="product-mini-icon">

                                  <i className="fa-solid fa-box"></i>

                                </div>


                                <strong>
                                  {product.name}
                                </strong>

                              </div>

                            </td>


                            {/* CATEGORY */}

                            <td>

                              {product.category ||
                                "General"}

                            </td>


                            {/* COST PRICE */}

                            <td>

                              ₦
                              {Number(
                                product.costPrice || 0
                              ).toLocaleString(
                                "en-NG"
                              )}

                            </td>


                            {/* SELLING PRICE */}

                            <td>

                              <strong>

                                ₦
                                {Number(
                                  product.sellingPrice ||
                                  0
                                ).toLocaleString(
                                  "en-NG"
                                )}

                              </strong>

                            </td>


                            {/* STOCK */}

                            <td>

                              {stock}

                            </td>


                            {/* STATUS */}

                            <td>

                              <span
                                className={
                                  isOutOfStock
                                    ? "status-badge owing"
                                    : isLowStock
                                    ? "status-badge owing"
                                    : "status-badge settled"
                                }
                              >

                                {isOutOfStock

                                  ? "Out of stock"

                                  : isLowStock

                                  ? "Low stock"

                                  : "In stock"}

                              </span>

                            </td>


                            {/* ACTIONS */}

                            <td>

                              <div className="table-actions">


                                {/* EDIT */}

                                <button
                                  className="icon-btn"
                                  onClick={() =>
                                    openEditProduct(
                                      product
                                    )
                                  }
                                  title="Edit product"
                                >

                                  <i className="fa-solid fa-pen"></i>

                                </button>


                                {/* DELETE */}

                                <button
                                  className="icon-btn danger"
                                  onClick={() =>
                                    setDeleteProduct(
                                      product
                                    )
                                  }
                                  title="Delete product"
                                >

                                  <i className="fa-solid fa-trash"></i>

                                </button>

                              </div>

                            </td>

                          </tr>

                        );

                      }

                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </main>

      </div>


      {/* =====================================================
          ADD / EDIT PRODUCT MODAL
      ===================================================== */}

      {showModal && (

        <ProductModal

          product={editingProduct}

          onClose={() => {

            setShowModal(false);

            setEditingProduct(null);

          }}

          onSave={saveProduct}

        />

      )}


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteProduct && (

        <div className="modal-overlay">

          <div className="modal small-modal">


            <div className="delete-icon">

              <i className="fa-solid fa-trash"></i>

            </div>


            <h2>
              Delete product?
            </h2>


            <p>

              Are you sure you want to delete{" "}

              <strong>
                {deleteProduct.name}
              </strong>

              ?

            </p>


            <div className="modal-actions">


              <button
                className="secondary-action"
                onClick={() =>
                  setDeleteProduct(null)
                }
              >

                Cancel

              </button>


              <button
                className="danger-action"
                onClick={confirmDelete}
              >

                Delete product

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


// =========================================================
// PRODUCT MODAL
// =========================================================

function ProductModal({
  product,
  onClose,
  onSave,
}) {

  const [form, setForm] = useState({

    name:
      product?.name || "",

    category:
      product?.category || "",

    costPrice:
      product?.costPrice ?? "",

    sellingPrice:
      product?.sellingPrice ?? "",

    stock:
      product?.stock ?? "",

    lowStockThreshold:
      product?.lowStockThreshold ?? 5,

  });


  // =========================================================
  // UPDATE FORM
  // =========================================================

  const updateField = (
    field,
    value
  ) => {

    setForm((previousForm) => ({

      ...previousForm,

      [field]: value,

    }));

  };


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = (e) => {

    e.preventDefault();


    if (!form.name.trim()) {
      return;
    }


    onSave(form);

  };


  // =========================================================
  // RENDER MODAL
  // =========================================================

  return (

    <div className="modal-overlay">


      <div className="app-modal modal-medium">


        {/* ===================================================
            MODAL HEADER
        =================================================== */}

        <div className="modal-header">

          <div>

            <h2>

              {product
                ? "Edit product"
                : "Add product"}

            </h2>


            <p>

              {product

                ? "Update your product information."

                : "Add information about a product your business sells."}

            </p>

          </div>


          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >

            <i className="fa-solid fa-xmark"></i>

          </button>

        </div>


        {/* ===================================================
            MODAL BODY
        =================================================== */}

        <div className="modal-body">


          <form
            className="app-form"
            onSubmit={handleSubmit}
          >


            {/* =================================================
                PRODUCT NAME
            ================================================= */}

            <div className="form-field">

              <label>
                Product name
              </label>


              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  updateField(
                    "name",
                    e.target.value
                  )
                }
                placeholder="e.g. Dangote Cement"
                required
              />

            </div>


            {/* =================================================
                CATEGORY
            ================================================= */}

            <div className="form-field">

              <label>
                Category
              </label>


              <input
                type="text"
                value={form.category}
                onChange={(e) =>
                  updateField(
                    "category",
                    e.target.value
                  )
                }
                placeholder="e.g. Building materials"
              />

            </div>


            {/* =================================================
                PRICES
            ================================================= */}

            <div className="form-row">


              {/* COST PRICE */}

              <div className="form-field">

                <label>
                  Cost price
                </label>


                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice}
                  onChange={(e) =>
                    updateField(
                      "costPrice",
                      e.target.value
                    )
                  }
                  placeholder="₦0"
                />

              </div>


              {/* SELLING PRICE */}

              <div className="form-field">

                <label>
                  Selling price
                </label>


                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    updateField(
                      "sellingPrice",
                      e.target.value
                    )
                  }
                  placeholder="₦0"
                />

              </div>

            </div>


            {/* =================================================
                STOCK
            ================================================= */}

            <div className="form-row">


              {/* CURRENT STOCK */}

              <div className="form-field">

                <label>
                  Current stock
                </label>


                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) =>
                    updateField(
                      "stock",
                      e.target.value
                    )
                  }
                  placeholder="0"
                />

              </div>


              {/* LOW STOCK ALERT */}

              <div className="form-field">

                <label>
                  Low-stock alert
                </label>


                <input
                  type="number"
                  min="0"
                  value={
                    form.lowStockThreshold
                  }
                  onChange={(e) =>
                    updateField(
                      "lowStockThreshold",
                      e.target.value
                    )
                  }
                  placeholder="5"
                />

              </div>

            </div>


            {/* =================================================
                ACTIONS
            ================================================= */}

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

                <i className="fa-solid fa-check"></i>


                {product
                  ? "Save changes"
                  : "Add product"}

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>

  );

}


export default Products;