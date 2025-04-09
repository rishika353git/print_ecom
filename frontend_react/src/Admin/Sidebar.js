import React from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import logo from "../../src/assets/Logo.png";

const Sidebar = () => {
  const location = useLocation(); // Get current route path

  const menuItems = [
    { path: "/dashboard", icon: "fa-tachometer-alt", label: "Dashboard" },
    { path: "/users", icon: "fa-users", label: "All Users" },
    { path: "/categories", icon: "fa-box", label: "Categories" },
    { path: "/stock-management", icon: "fa-warehouse", label: "Add Murchadise" },
    { path: "/add-banner", icon: "fa-image", label: "Add Banner" },
    { path: "/stocks", icon: "fa-warehouse", label: "Murchadise" },
    { path: "/accessory", icon: "fa-warehouse", label: "Add Accessories" },
    { path: "/accessories", icon: "fa-warehouse", label: "Accessories" },
    { path: "/add/cutomize/product", icon: "fa-warehouse", label: "Add Cutomize Murchadise" },
    { path: "/merchandise", icon: "fa-warehouse", label: "Cutomize Murchadises" },
    { path: "/add/cutomize/accessories", icon: "fa-warehouse", label: "Add Cutomize Accessories" },
    { path: "/accessories/cutomize", icon: "fa-warehouse", label: "Cutomize Accessories" },
    { path: "/orders", icon: "fa-shopping-cart", label: "Orders" },
    { path: "/headline", icon: "fa-shopping-cart", label: "Headline" },
    { path: "/coupons", icon: "fa-shopping-cart", label: "Coupons" },
    { path: "/addblog", icon: "fa-shopping-cart", label: "Add Blog" },
  
    
    
    { path: "/logout", icon: "fa-sign-out-alt", label: "Logout" },
  ];

  return (
    <div className="bg-white vh-100 px-3 py-4 border-end">
      {/* Logo Section */}
      <div className="text-center mb-4">
        <img src={logo} alt="Logo" className="img-fluid" style={{ width: "120px" }} />
      </div>

      {/* Sidebar Navigation */}
      <ul className="nav flex-column">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path; // Check if link is active
          return (
            <li className="nav-item mb-2" key={index}>
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center px-3 py-2 rounded ${
                  isActive ? "bg-primary text-white" : "text-dark"
                }`}
              >
                <i className={`fas ${item.icon} me-2`}></i> {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
