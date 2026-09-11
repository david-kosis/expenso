import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

import "./Index.css";

function AccountSettings() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const [businessName, setBusinessName] =
    useState("My Business");

  const [currency, setCurrency] =
    useState("NGN");

  const [profilePicture, setProfilePicture] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }

    const storedBusiness =
      localStorage.getItem(
        "expensoBusinessName"
      );

    if (storedBusiness) {
      setBusinessName(storedBusiness);
    }

    const storedCurrency =
      localStorage.getItem(
        "expensoCurrency"
      );

    if (storedCurrency) {
      setCurrency(storedCurrency);
    }

    const picture =
      localStorage.getItem(
        "expensoProfilePicture"
      );

    if (picture) {
      setProfilePicture(picture);
    }
  }, []);

  const saveProfile = () => {
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "expensoBusinessName",
      businessName
    );

    localStorage.setItem(
      "expensoCurrency",
      currency
    );

    setMessage(
      "Your account settings have been saved."
    );

    setTimeout(
      () => setMessage(""),
      3000
    );
  };

  const changePicture = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage(
        "Please select an image file."
      );
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setMessage(
        "Please choose an image smaller than 3MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image =
        reader.result;

      setProfilePicture(image);

      localStorage.setItem(
        "expensoProfilePicture",
        image
      );

      setMessage(
        "Profile picture updated."
      );

      setTimeout(
        () => setMessage(""),
        3000
      );
    };

    reader.readAsDataURL(file);
  };

  const removePicture = () => {
    setProfilePicture("");

    localStorage.removeItem(
      "expensoProfilePicture"
    );

    setMessage(
      "Profile picture removed."
    );

    setTimeout(
      () => setMessage(""),
      3000
    );
  };

  return (
    <div className="expenso-app">

      <Sidebar />

      <div className="main-content">

        <Header
          onProfileClick={() =>
            navigate("/account-settings")
          }
        />

        <main className="dashboard-page">

          <section className="page-top">

            <div>
              <span className="dashboard-label">
                SETTINGS
              </span>

              <h1>
                Account settings
              </h1>

              <p>
                Manage your profile and
                business preferences.
              </p>
            </div>

          </section>

          {message && (
            <div className="settings-message">

              <i className="fa-solid fa-circle-check"></i>

              {message}

            </div>
          )}

          <div className="settings-layout">

            {/* PROFILE */}

            <section className="settings-card">

              <div className="settings-card-header">

                <div>
                  <h2>
                    Profile
                  </h2>

                  <p>
                    Your personal account
                    information.
                  </p>
                </div>

              </div>

              <div className="profile-picture-section">

                <div className="large-profile-avatar">

                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                    />
                  ) : (
                    <i className="fa-solid fa-user"></i>
                  )}

                </div>

                <div>

                  <h3>
                    Profile picture
                  </h3>

                  <p>
                    Use a clear image that
                    represents you.
                  </p>

                  <div className="picture-actions">

                    <label className="secondary-action upload-button">

                      <i className="fa-solid fa-camera"></i>

                      Change picture

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          changePicture
                        }
                        hidden
                      />

                    </label>

                    {profilePicture && (
                      <button
                        className="text-danger"
                        onClick={
                          removePicture
                        }
                      >
                        Remove
                      </button>
                    )}

                  </div>

                </div>

              </div>

              <div className="settings-divider"></div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Full name
                  </label>

                  <input
                    value={
                      user.name || ""
                    }
                    onChange={(e) =>
                      setUser((prev) => ({
                        ...prev,
                        name:
                          e.target.value,
                      }))
                    }
                    placeholder="Your name"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Email address
                  </label>

                  <input
                    type="email"
                    value={
                      user.email || ""
                    }
                    onChange={(e) =>
                      setUser((prev) => ({
                        ...prev,
                        email:
                          e.target.value,
                      }))
                    }
                    placeholder="you@example.com"
                  />

                </div>

              </div>

            </section>

            {/* BUSINESS */}

            <section className="settings-card">

              <div className="settings-card-header">

                <div>
                  <h2>
                    Business preferences
                  </h2>

                  <p>
                    Configure how Expenso
                    works for your business.
                  </p>
                </div>

              </div>

              <div className="form-group">

                <label>
                  Business name
                </label>

                <input
                  value={businessName}
                  onChange={(e) =>
                    setBusinessName(
                      e.target.value
                    )
                  }
                  placeholder="Your business name"
                />

              </div>

              <div className="form-group">

                <label>
                  Currency
                </label>

                <select
                  value={currency}
                  onChange={(e) =>
                    setCurrency(
                      e.target.value
                    )
                  }
                >
                  <option value="NGN">
                    Nigerian Naira (₦)
                  </option>

                  <option value="USD">
                    US Dollar ($)
                  </option>

                  <option value="GBP">
                    British Pound (£)
                  </option>

                  <option value="EUR">
                    Euro (€)
                  </option>
                </select>

              </div>

              <div className="settings-preference">

                <div className="preference-icon">
                  <i className="fa-solid fa-bell"></i>
                </div>

                <div>
                  <strong>
                    Business notifications
                  </strong>

                  <span>
                    Receive alerts for
                    outstanding payments
                    and low stock.
                  </span>
                </div>

                <span className="preference-status">
                  Enabled
                </span>

              </div>

              <div className="settings-preference">

                <div className="preference-icon">
                  <i className="fa-solid fa-chart-line"></i>
                </div>

                <div>
                  <strong>
                    Automatic reports
                  </strong>

                  <span>
                    Keep business statistics
                    updated automatically.
                  </span>
                </div>

                <span className="preference-status">
                  Enabled
                </span>

              </div>

              <div className="settings-save">

                <button
                  className="primary-action"
                  onClick={saveProfile}
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  Save changes
                </button>

              </div>

            </section>

            {/* SECURITY SHORTCUT */}

            <section className="settings-card">

              <div className="settings-card-header">

                <div>
                  <h2>
                    Account security
                  </h2>

                  <p>
                    Keep your account
                    protected.
                  </p>
                </div>

              </div>

              <div className="security-shortcut">

                <div className="security-shortcut-icon">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>

                <div>
                  <strong>
                    Password & security
                  </strong>

                  <span>
                    Change your password
                    and manage your active
                    session.
                  </span>
                </div>

                <button
                  onClick={() =>
                    navigate("/security")
                  }
                >
                  Manage
                  <i className="fa-solid fa-arrow-right"></i>
                </button>

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
}

export default AccountSettings;