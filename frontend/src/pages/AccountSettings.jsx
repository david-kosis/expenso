import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { getUser, getCustomers, getSuppliers, getProducts } from "../api/storage";

import "./index.css";
import "./Account.css";

function Account() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(
    searchParams.get("section") === "security"
      ? "security"
      : searchParams.get("section") === "profile"
        ? "profile"
        : "overview"
  );
  const [user, setUser] = useState(getUser() || {});
  const [businessName, setBusinessName] = useState(
    localStorage.getItem("expensoBusinessName") || ""
  );

  const stats = useMemo(() => ({
    customers: getCustomers().length,
    suppliers: getSuppliers().length,
    products: getProducts().length,
  }), []);

  useEffect(() => {
    const refreshUser = () => {
      setUser(getUser() || {});
      setBusinessName(localStorage.getItem("expensoBusinessName") || "");
    };

    window.addEventListener("storage", refreshUser);
    window.addEventListener("expenso-profile-updated", refreshUser);

    return () => {
      window.removeEventListener("storage", refreshUser);
      window.removeEventListener("expenso-profile-updated", refreshUser);
    };
  }, []);

  useEffect(() => {
    const section = searchParams.get("section");
    setActiveSection(
      section === "security" || section === "profile" ? section : "overview"
    );
  }, [searchParams]);

  const goTo = (section) => {
    setSearchParams(section === "overview" ? {} : { section });
  };

  const name = user?.name || "Your name";
  const email = user?.email || "Not available";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="expenso-app account-page">
      <Sidebar />

      <div className="main-content">
        <Header />

        <main className="account-main">
          <section className="account-heading account-hero">
            <div>
              <span className="account-kicker">ACCOUNT MANAGEMENT</span>
              <h1>My account</h1>
              <p>Manage your personal information, business profile and security.</p>
            </div>

            <button
              type="button"
              className="account-hero-button"
              onClick={() => goTo("profile")}
            >
              <i className="fa-solid fa-pen-to-square" />
              Edit profile
            </button>
          </section>

          <section className="account-identity-card">
            <div className="account-identity-avatar">{initials || "U"}</div>
            <div className="account-identity-info">
              <div className="account-identity-name-row">
                <h2>{name}</h2>
                <span className="account-status-pill"><span /> Active</span>
              </div>
              <p>{email}</p>
              <small>
                <i className="fa-solid fa-briefcase" />
                {businessName || "Business name not set"}
              </small>
            </div>
            <div className="account-identity-action">
              <button type="button" onClick={() => navigate("/account/settings")}>
                Account settings <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </section>

          <section className="account-stat-grid">
            <button type="button" className="account-stat-card" onClick={() => navigate("/customers")}>
              <span className="account-stat-icon red"><i className="fa-solid fa-users" /></span>
              <span><small>Customers</small><strong>{stats.customers}</strong></span>
              <i className="fa-solid fa-arrow-up-right-from-square" />
            </button>
            <button type="button" className="account-stat-card" onClick={() => navigate("/suppliers")}>
              <span className="account-stat-icon blue"><i className="fa-solid fa-truck" /></span>
              <span><small>Suppliers</small><strong>{stats.suppliers}</strong></span>
              <i className="fa-solid fa-arrow-up-right-from-square" />
            </button>
            <button type="button" className="account-stat-card" onClick={() => navigate("/products")}>
              <span className="account-stat-icon purple"><i className="fa-solid fa-box" /></span>
              <span><small>Products</small><strong>{stats.products}</strong></span>
              <i className="fa-solid fa-arrow-up-right-from-square" />
            </button>
          </section>

          <div className="account-tabs" role="tablist" aria-label="Account sections">
            <button type="button" className={activeSection === "overview" ? "active" : ""} onClick={() => goTo("overview")}>
              Overview
            </button>
            <button type="button" className={activeSection === "profile" ? "active" : ""} onClick={() => goTo("profile")}>
              Profile Settings
            </button>
            <button type="button" className={activeSection === "security" ? "active" : ""} onClick={() => goTo("security")}>
              Security
            </button>
          </div>

          {activeSection === "overview" && (
            <section className="account-overview-card account-table-card">
              <div className="account-section-heading">
                <div>
                  <span className="account-section-eyebrow">ACCOUNT DETAILS</span>
                  <h2>Account overview</h2>
                  <p>A quick summary of your Expenso account.</p>
                </div>
                <span className="account-secure-badge"><i className="fa-solid fa-shield-halved" /> Secure</span>
              </div>

              <div className="account-details-table">
                <div className="account-table-row account-table-head">
                  <span>Information</span><span>Details</span><span>Action</span>
                </div>
                <div className="account-table-row">
                  <div className="account-table-label"><span className="table-row-icon red"><i className="fa-regular fa-user" /></span><span>Full name</span></div>
                  <strong>{name}</strong>
                  <button type="button" onClick={() => goTo("profile")}>Edit <i className="fa-solid fa-arrow-right" /></button>
                </div>
                <div className="account-table-row">
                  <div className="account-table-label"><span className="table-row-icon blue"><i className="fa-regular fa-envelope" /></span><span>Email address</span></div>
                  <strong>{email}</strong>
                  <button type="button" onClick={() => goTo("profile")}>Edit <i className="fa-solid fa-arrow-right" /></button>
                </div>
                <div className="account-table-row">
                  <div className="account-table-label"><span className="table-row-icon purple"><i className="fa-solid fa-briefcase" /></span><span>Business name</span></div>
                  <strong>{businessName || "Not set"}</strong>
                  <button type="button" onClick={() => navigate("/account/settings")}>Manage <i className="fa-solid fa-arrow-right" /></button>
                </div>
                <div className="account-table-row">
                  <div className="account-table-label"><span className="table-row-icon green"><i className="fa-solid fa-circle-check" /></span><span>Account status</span></div>
                  <strong className="table-active-status"><span /> Active</strong>
                  <button type="button" onClick={() => goTo("security")}>Security <i className="fa-solid fa-arrow-right" /></button>
                </div>
              </div>
            </section>
          )}

          {activeSection === "profile" && (
            <section className="account-content-card profile-preview-card">
              <div className="account-section-heading">
                <div>
                  <span className="account-section-eyebrow">PERSONAL INFORMATION</span>
                  <h2>Profile settings</h2>
                  <p>Keep your personal and business information up to date.</p>
                </div>
              </div>

              <div className="profile-preview-grid">
                <div className="profile-preview-item"><span>Full name</span><strong>{name}</strong></div>
                <div className="profile-preview-item"><span>Email address</span><strong>{email}</strong></div>
                <div className="profile-preview-item"><span>Business name</span><strong>{businessName || "Not set"}</strong></div>
              </div>

              <div className="profile-settings-actions">
                <div className="profile-settings-hint"><i className="fa-solid fa-circle-info" /><span>Changes are saved securely to your account.</span></div>
                <button type="button" className="account-primary-button" onClick={() => navigate("/account/settings")}>
                  <i className="fa-solid fa-gear" /> Open account settings
                </button>
              </div>
            </section>
          )}

          {activeSection === "security" && (
            <section className="account-content-card">
              <div className="account-section-heading">
                <div>
                  <span className="account-section-eyebrow">PROTECTION</span>
                  <h2>Security</h2>
                  <p>Keep your Expenso account protected.</p>
                </div>
                <span className="account-secure-badge"><i className="fa-solid fa-lock" /> Protected</span>
              </div>

              <div className="security-item">
                <div className="security-item-icon"><i className="fa-solid fa-lock" /></div>
                <div><strong>Password</strong><p>Change your password regularly to help keep your account secure.</p></div>
                <button type="button" className="account-secondary-button" onClick={() => navigate("/forgot-password")}>Reset password <i className="fa-solid fa-arrow-right" /></button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Account;
