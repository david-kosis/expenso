import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        type="button"
        className={`mobile-menu-button ${
          isOpen ? "menu-button-open" : ""
        }`}
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <i
          className={
            isOpen
              ? "fa-solid fa-xmark"
              : "fa-solid fa-bars"
          }
        ></i>
      </button>


      {/* DARK BACKGROUND */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        ></div>
      )}


      {/* SIDEBAR */}
      <aside
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >

        {/* LOGO */}
        <div className="sidebar-logo">

          <div className="sidebar-logo-mark">
            E
          </div>

          <div className="sidebar-logo-text">
            <strong>Expenso</strong>
            <span>Business Manager</span>
          </div>

        </div>


        {/* NAVIGATION */}
        <nav className="sidebar-nav">

          <NavLink
            to="/"
            end
            onClick={closeSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <i className="fa-solid fa-house"></i>
            <span>Dashboard</span>
          </NavLink>


          <NavLink
            to="/customers"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <i className="fa-solid fa-users"></i>
            <span>Customers</span>
          </NavLink>


          <NavLink
            to="/suppliers"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <i className="fa-solid fa-truck"></i>
            <span>Suppliers</span>
          </NavLink>


          <NavLink
            to="/products"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <i className="fa-solid fa-box"></i>
            <span>Products</span>
          </NavLink>


          <NavLink
            to="/reports"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <i className="fa-solid fa-chart-column"></i>
            <span>Reports</span>
          </NavLink>

        </nav>


        {/* ACCOUNT */}
        <div className="sidebar-bottom">

          <NavLink
            to="/account"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <i className="fa-solid fa-gear"></i>
            <span>Account</span>
          </NavLink>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;