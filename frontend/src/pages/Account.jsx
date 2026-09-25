import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import AccountAlertModal from "../components/alert/AccountAlertModal";

import {
  getUser,
  saveUser,
  getCustomers,
  getSuppliers,
  getProducts,
} from "../api/storage";

import {
  uploadProfilePicture,
  removeProfilePicture,
  API_URL,
} from "../services/api";

import "./index.css";
import "./Account.css";

// =========================================
// PROFILE IMAGE URL HELPER
// =========================================

const getProfileImageUrl = (profilePicture) => {
  if (!profilePicture) {
    return "";
  }

  // If the backend/database already contains a complete URL,
  // use it directly.
  if (
    profilePicture.startsWith("http://") ||
    profilePicture.startsWith("https://")
  ) {
    return profilePicture;
  }

  // If MongoDB stores /uploads/filename.png
  return `${API_URL}${
    profilePicture.startsWith("/")
      ? ""
      : "/"
  }${profilePicture}`;
};

function Account() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] =
    useSearchParams();

  // =========================================
  // ALERT MODAL
  // =========================================

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showAlert = (
    message,
    title = "Success",
    type = "success"
  ) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const closeAlert = () => {
    setAlertModal((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // =========================================
  // ACTIVE SECTION
  // =========================================

  const getSectionFromUrl = () => {
    const section = searchParams.get("section");

    if (section === "profile") {
      return "profile";
    }

    if (section === "security") {
      return "security";
    }

    return "overview";
  };

  const [activeSection, setActiveSection] =
    useState(getSectionFromUrl());

  // =========================================
  // USER
  // =========================================

  const [user, setUser] = useState(() => {
    try {
      return getUser() || {};
    } catch (error) {
      console.error(
        "Unable to load user:",
        error
      );

      return {};
    }
  });

  // =========================================
  // PROFILE IMAGE
  // =========================================

  const [profileImage, setProfileImage] =
    useState(() => {
      const currentUser = getUser() || {};

      return getProfileImageUrl(
        currentUser.profilePicture
      );
    });

  // =========================================
  // BUSINESS NAME
  // =========================================

  const [businessName, setBusinessName] =
    useState(
      () =>
        localStorage.getItem(
          "expensoBusinessName"
        ) || ""
    );

  // =========================================
  // STATS
  // =========================================

  const [stats, setStats] = useState({
    customers: 0,
    suppliers: 0,
    products: 0,
  });

  // =========================================
  // REFRESH ACCOUNT
  // =========================================

  const refreshAccount = () => {
    try {
      const currentUser = getUser() || {};

      setUser(currentUser);

      setProfileImage(
        getProfileImageUrl(
          currentUser.profilePicture
        )
      );

      setBusinessName(
        localStorage.getItem(
          "expensoBusinessName"
        ) || ""
      );

      const customers = getCustomers();
      const suppliers = getSuppliers();
      const products = getProducts();

      setStats({
        customers: Array.isArray(customers)
          ? customers.length
          : 0,

        suppliers: Array.isArray(suppliers)
          ? suppliers.length
          : 0,

        products: Array.isArray(products)
          ? products.length
          : 0,
      });
    } catch (error) {
      console.error(
        "Error refreshing account:",
        error
      );
    }
  };

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    refreshAccount();

    const handleStorageChange = () => {
      refreshAccount();
    };

    const handleProfileUpdate = () => {
      refreshAccount();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      "expenso-profile-updated",
      handleProfileUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "expenso-profile-updated",
        handleProfileUpdate
      );
    };
  }, []);

  // =========================================
  // URL SECTION
  // =========================================

  useEffect(() => {
    const section =
      searchParams.get("section");

    if (
      section === "profile" ||
      section === "security"
    ) {
      setActiveSection(section);
    } else {
      setActiveSection("overview");
    }
  }, [searchParams]);

  // =========================================
  // CHANGE SECTION
  // =========================================

  const handleLogout = async () => {
    try { await logoutUser(); } catch {}
    removeUser();
    removeToken();
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  const goTo = (section) => {
    if (section === "overview") {
      setSearchParams({});
      return;
    }

    setSearchParams({
      section,
    });
  };

  // =========================================
  // UPLOAD PROFILE IMAGE
  // =========================================

  const handleProfileImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Check image type
    if (!file.type.startsWith("image/")) {
      showAlert(
        "Please select a valid image file.",
        "Invalid image",
        "warning"
      );

      event.target.value = "";
      return;
    }

    // Maximum 3MB
    if (file.size > 3 * 1024 * 1024) {
      showAlert(
        "Your profile picture must be less than 3MB.",
        "Image too large",
        "warning"
      );

      event.target.value = "";
      return;
    }

    try {
      // Send image to backend using Multer
      const data =
        await uploadProfilePicture(file);

      const imagePath =
        data.profilePicture || "";

      // Update local user object
      const updatedUser = {
        ...getUser(),
        profilePicture: imagePath,
      };

      // Save user information locally
      saveUser(updatedUser);

      // Update React state
      setUser(updatedUser);

      // Convert /uploads/... into
      // http://localhost:5000/uploads/...
      setProfileImage(
        getProfileImageUrl(imagePath)
      );

      // Tell Header/ProfileModal/etc.
      window.dispatchEvent(
        new Event(
          "expenso-profile-updated"
        )
      );

      showAlert(
        "Your profile picture has been updated successfully.",
        "Picture updated",
        "success"
      );
    } catch (error) {
      console.error(
        "Unable to upload profile image:",
        error
      );

      showAlert(
        error.message ||
          "Unable to upload profile picture.",
        "Upload failed",
        "error"
      );
    } finally {
      // Allow the same file to be selected again
      event.target.value = "";
    }
  };

  // =========================================
  // REMOVE PROFILE IMAGE
  // =========================================

  const handleRemoveProfileImage =
    async () => {
      try {
        await removeProfilePicture();

        const updatedUser = {
          ...getUser(),
          profilePicture: "",
        };

        saveUser(updatedUser);

        setUser(updatedUser);
        setProfileImage("");

        window.dispatchEvent(
          new Event(
            "expenso-profile-updated"
          )
        );

        showAlert(
          "Your profile picture has been removed.",
          "Picture removed",
          "success"
        );
      } catch (error) {
        console.error(
          "Unable to remove profile image:",
          error
        );

        showAlert(
          error.message ||
            "Unable to remove your profile picture. Please try again.",
          "Removal failed",
          "error"
        );
      }
    };

  // =========================================
  // SAVE PROFILE
  // =========================================

  const saveProfile = () => {
    try {
      const updatedName =
        user?.name?.trim() || "";

      const updatedEmail =
        user?.email?.trim() || "";

      // Validate name
      if (!updatedName) {
        showAlert(
          "Please enter your full name before saving.",
          "Name required",
          "warning"
        );

        return;
      }

      // Validate email
      if (!updatedEmail) {
        showAlert(
          "Please enter your email address before saving.",
          "Email required",
          "warning"
        );

        return;
      }

      const updatedUser = {
        ...user,
        name: updatedName,
        email: updatedEmail,
      };

      // Save user
      saveUser(updatedUser);

      // Save business name
      localStorage.setItem(
        "expensoBusinessName",
        businessName.trim()
      );

      // Update React state
      setUser(updatedUser);

      setBusinessName(
        businessName.trim()
      );

      // Notify Header and other components
      window.dispatchEvent(
        new Event(
          "expenso-profile-updated"
        )
      );

      showAlert(
        "Your profile information has been updated successfully.",
        "Profile updated",
        "success"
      );
    } catch (error) {
      console.error(
        "Unable to save profile:",
        error
      );

      showAlert(
        "Unable to save your profile changes. Please try again.",
        "Update failed",
        "error"
      );
    }
  };

  // =========================================
  // USER DISPLAY
  // =========================================

  const name =
    user?.name || "Your name";

  const email =
    user?.email || "Not available";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) =>
      part.charAt(0)
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="expenso-app account-page">

      <Sidebar />

      <div className="main-content">

        <Header />

        <main className="account-main">

          {/* =====================================
              PAGE HEADER
          ====================================== */}

          <section className="account-heading account-hero">

            <div>

              <span className="account-kicker">
                ACCOUNT MANAGEMENT
              </span>

              <h1>
                My account
              </h1>

              <p>
                Manage your personal information,
                business profile and security.
              </p>

            </div>

            <button
              type="button"
              className="account-hero-button"
              onClick={() =>
                goTo("profile")
              }
            >
              <i className="fa-solid fa-pen-to-square" />

              Edit profile
            </button>

          </section>

          {/* =====================================
              IDENTITY CARD
          ====================================== */}

          <section className="account-identity-card">

            <div className="account-identity-avatar">

              {profileImage ? (
                <img
                  src={profileImage}
                  alt={name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                initials || "U"
              )}

            </div>

            <div className="account-identity-info">

              <div className="account-identity-name-row">

                <h2>
                  {name}
                </h2>

                <span className="account-status-pill">
                  <span />
                  Active
                </span>

              </div>

              <p>
                {email}
              </p>

              <small>
                <i className="fa-solid fa-briefcase" />

                {businessName ||
                  "Business name not set"}
              </small>

            </div>

            <div className="account-identity-action">

              <button
                type="button"
                onClick={() =>
                  goTo("profile")
                }
              >
                Account settings

                <i className="fa-solid fa-arrow-right" />
              </button>

            </div>

          </section>

          {/* =====================================
              STATISTICS
          ====================================== */}

          <section className="account-stat-grid">

            {/* CUSTOMERS */}

            <button
              type="button"
              className="account-stat-card"
              onClick={() =>
                navigate("/customers")
              }
            >

              <span className="account-stat-icon red">

                <i className="fa-solid fa-users" />

              </span>

              <span>

                <small>
                  Customers
                </small>

                <strong>
                  {stats.customers}
                </strong>

              </span>

              <i className="fa-solid fa-arrow-up-right-from-square" />

            </button>

            {/* SUPPLIERS */}

            <button
              type="button"
              className="account-stat-card"
              onClick={() =>
                navigate("/suppliers")
              }
            >

              <span className="account-stat-icon blue">

                <i className="fa-solid fa-truck" />

              </span>

              <span>

                <small>
                  Suppliers
                </small>

                <strong>
                  {stats.suppliers}
                </strong>

              </span>

              <i className="fa-solid fa-arrow-up-right-from-square" />

            </button>

            {/* PRODUCTS */}

            <button
              type="button"
              className="account-stat-card"
              onClick={() =>
                navigate("/product")
              }
            >

              <span className="account-stat-icon purple">

                <i className="fa-solid fa-box" />

              </span>

              <span>

                <small>
                  Products
                </small>

                <strong>
                  {stats.products}
                </strong>

              </span>

              <i className="fa-solid fa-arrow-up-right-from-square" />

            </button>

          </section>

          {/* =====================================
              TABS
          ====================================== */}

          <div
            className="account-tabs"
            role="tablist"
            aria-label="Account sections"
          >

            <button
              type="button"
              className={
                activeSection === "overview"
                  ? "active"
                  : ""
              }
              onClick={() =>
                goTo("overview")
              }
            >
              Overview
            </button>

            <button
              type="button"
              className={
                activeSection === "profile"
                  ? "active"
                  : ""
              }
              onClick={() =>
                goTo("profile")
              }
            >
              Profile Settings
            </button>

            <button
              type="button"
              className={
                activeSection === "security"
                  ? "active"
                  : ""
              }
              onClick={() =>
                goTo("security")
              }
            >
              Security
            </button>

          </div>

          {/* =====================================
              OVERVIEW
          ====================================== */}

          {activeSection === "overview" && (

            <section className="account-overview-card account-table-card">

              <div className="account-section-heading">

                <div>

                  <span className="account-section-eyebrow">
                    ACCOUNT DETAILS
                  </span>

                  <h2>
                    Account overview
                  </h2>

                  <p>
                    A quick summary of your Expenso account.
                  </p>

                </div>

                <span className="account-secure-badge">

                  <i className="fa-solid fa-shield-halved" />

                  Secure

                </span>

              </div>

              <div className="account-details-table">

                <div className="account-table-row account-table-head">

                  <span>
                    Information
                  </span>

                  <span>
                    Details
                  </span>

                  <span>
                    Action
                  </span>

                </div>

                {/* NAME */}

                <div className="account-table-row">

                  <div className="account-table-label">

                    <span className="table-row-icon red">

                      <i className="fa-regular fa-user" />

                    </span>

                    <span>
                      Full name
                    </span>

                  </div>

                  <strong>
                    {name}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      goTo("profile")
                    }
                  >
                    Edit

                    <i className="fa-solid fa-arrow-right" />

                  </button>

                </div>

                {/* EMAIL */}

                <div className="account-table-row">

                  <div className="account-table-label">

                    <span className="table-row-icon blue">

                      <i className="fa-regular fa-envelope" />

                    </span>

                    <span>
                      Email address
                    </span>

                  </div>

                  <strong>
                    {email}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      goTo("profile")
                    }
                  >
                    Edit

                    <i className="fa-solid fa-arrow-right" />

                  </button>

                </div>

                {/* BUSINESS */}

                <div className="account-table-row">

                  <div className="account-table-label">

                    <span className="table-row-icon purple">

                      <i className="fa-solid fa-briefcase" />

                    </span>

                    <span>
                      Business name
                    </span>

                  </div>

                  <strong>
                    {businessName ||
                      "Not set"}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      goTo("profile")
                    }
                  >
                    Manage

                    <i className="fa-solid fa-arrow-right" />

                  </button>

                </div>

                {/* STATUS */}

                <div className="account-table-row">

                  <div className="account-table-label">

                    <span className="table-row-icon green">

                      <i className="fa-solid fa-circle-check" />

                    </span>

                    <span>
                      Account status
                    </span>

                  </div>

                  <strong className="table-active-status">

                    <span />

                    Active

                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      goTo("security")
                    }
                  >
                    Security

                    <i className="fa-solid fa-arrow-right" />

                  </button>

                </div>

              </div>

            </section>

          )}

          {/* =====================================
              PROFILE SETTINGS
          ====================================== */}

          {activeSection === "profile" && (

            <section className="account-content-card profile-edit-card">

              <div className="account-section-heading">

                <div>

                  <span className="account-section-eyebrow">
                    PERSONAL INFORMATION
                  </span>

                  <h2>
                    Profile settings
                  </h2>

                  <p>
                    Update your personal information,
                    profile picture and business details.
                  </p>

                </div>

              </div>

              {/* PROFILE PICTURE */}

              <div className="profile-picture-section">

                <div className="profile-picture-preview">

                  {profileImage ? (

                    <img
                      src={profileImage}
                      alt={name}
                    />

                  ) : (

                    <span>
                      {initials || "U"}
                    </span>

                  )}

                </div>

                <div className="profile-picture-info">

                  <h3>
                    Profile picture
                  </h3>

                  <p>
                    Upload a picture to personalize
                    your Expenso account.
                  </p>

                  <div className="profile-picture-actions">

                    <label
                      htmlFor="profile-picture-upload"
                      className="account-secondary-button"
                    >

                      <i className="fa-solid fa-camera" />

                      Change picture

                    </label>

                    <input
                      id="profile-picture-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      style={{
                        display: "none",
                      }}
                      onChange={
                        handleProfileImage
                      }
                    />

                    {profileImage && (

                      <button
                        type="button"
                        className="profile-remove-picture"
                        onClick={
                          handleRemoveProfileImage
                        }
                      >
                        Remove
                      </button>

                    )}

                  </div>

                </div>

              </div>

              {/* EDIT FORM */}

              <div className="account-edit-form">

                {/* FULL NAME */}

                <div className="account-form-group">

                  <label htmlFor="account-name">
                    Full name
                  </label>

                  <div className="account-input-wrapper">

                    <i className="fa-regular fa-user" />

                    <input
                      id="account-name"
                      type="text"
                      value={
                        user?.name || ""
                      }
                      onChange={(event) => {
                        setUser({
                          ...user,
                          name: event.target.value,
                        });
                      }}
                      placeholder="Enter your full name"
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="account-form-group">

                  <label htmlFor="account-email">
                    Email address
                  </label>

                  <div className="account-input-wrapper">

                    <i className="fa-regular fa-envelope" />

                    <input
                      id="account-email"
                      type="email"
                      value={
                        user?.email || ""
                      }
                      onChange={(event) => {
                        setUser({
                          ...user,
                          email: event.target.value,
                        });
                      }}
                      placeholder="Enter your email address"
                    />

                  </div>

                  {/* EMAIL VERIFICATION */}

                  <div className="email-verification-row">

                    <div className="email-verification-status">

                      {user?.emailVerified ? (

                        <>
                          <i className="fa-solid fa-circle-check verified" />

                          <span>
                            Email verified
                          </span>
                        </>

                      ) : (

                        <>
                          <i className="fa-solid fa-circle-exclamation unverified" />

                          <span>
                            Email not verified
                          </span>
                        </>

                      )}

                    </div>

                    {!user?.emailVerified && (

                      <button
                        type="button"
                        className="verify-email-button"
                        onClick={() => {
                          showAlert(
                            "Email verification will be connected to your backend.",
                            "Verification coming soon",
                            "info"
                          );
                        }}
                      >
                        Verify email
                      </button>

                    )}

                  </div>

                </div>

                {/* BUSINESS NAME */}

                <div className="account-form-group">

                  <label htmlFor="account-business">
                    Business name
                  </label>

                  <div className="account-input-wrapper">

                    <i className="fa-solid fa-briefcase" />

                    <input
                      id="account-business"
                      type="text"
                      value={
                        businessName
                      }
                      onChange={(event) =>
                        setBusinessName(
                          event.target.value
                        )
                      }
                      placeholder="Enter your business name"
                    />

                  </div>

                </div>

                {/* SAVE */}

                <div className="account-form-actions">

                  <button
                    type="button"
                    className="account-primary-button"
                    onClick={saveProfile}
                  >

                    <i className="fa-solid fa-floppy-disk" />

                    Save changes

                  </button>

                </div>

              </div>

            </section>

          )}

          {/* =====================================
              SECURITY
          ====================================== */}

          {activeSection === "security" && (

            <section className="account-content-card">

              <div className="account-section-heading">

                <div>

                  <span className="account-section-eyebrow">
                    PROTECTION
                  </span>

                  <h2>
                    Security
                  </h2>

                  <p>
                    Keep your Expenso account protected.
                  </p>

                </div>

                <span className="account-secure-badge">

                  <i className="fa-solid fa-lock" />

                  Protected

                </span>

              </div>

              <div className="security-item">

                <div className="security-item-icon">

                  <i className="fa-solid fa-lock" />

                </div>

                <div>

                  <strong>
                    Password
                  </strong>

                  <p>
                    Change your password regularly
                    to help keep your account secure.
                  </p>

                </div>

                <button
                  type="button"
                  className="account-secondary-button"
                  onClick={() =>
                    navigate(
                      "/forgot-password"
                    )
                  }
                >

                  Reset password

                  <i className="fa-solid fa-arrow-right" />

                </button>

              </div>

            </section>

          )}

        </main>

      </div>

      {/* =====================================
          ACCOUNT ALERT MODAL
      ====================================== */}

      <AccountAlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={closeAlert}
      />

    </div>
  );
}

export default Account;