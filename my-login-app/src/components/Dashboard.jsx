import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./Dashboard.css";
import { FaSearch } from "react-icons/fa";
import Inventory from "./Inventory";
import Billing from "./Billing";
import SalesReport from "./Salesreport";
import Employee from "./Employee";
import Customer from "./Customer";
import NotificationBell from "./NotificationBell";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const [featuredPerfumes, setFeaturedPerfumes] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);

  // Fetch featured perfumes
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setFeaturedPerfumes(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Fetch recent purchases (orders)
  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then((res) => res.json())
      .then((data) => {
        // Flatten each order -> one row per product
        const formatted = data.flatMap((o) =>
          o.order.map((item) => ({
            id: o._id, // use MongoDB id as order reference
            product: item.productName,
            customer: o.customerName,
            price: item.price,
            date: new Date(o.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          }))
        );
        setRecentPurchases(formatted);
      })
      .catch((err) => console.error("Error fetching orders:", err));
  }, []);

  // Filter by search
  const filteredPurchases = recentPurchases.filter(
    (purchase) =>
      purchase.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="left-sidebar">
        <div className="sidebar-content">
          <h2
            onClick={() => setActivePage("dashboard")}
            className={activePage === "dashboard" ? "active" : ""}
          >
            Dashboard
          </h2>
          <h2
            onClick={() => setActivePage("inventory")}
            className={activePage === "inventory" ? "active" : ""}
          >
            Inventory
          </h2>
          <h2
            onClick={() => setActivePage("billing")}
            className={activePage === "billing" ? "active" : ""}
          >
            Billing
          </h2>
          <h2
            onClick={() => setActivePage("employee")}
            className={activePage === "employee" ? "active" : ""}
          >
            Employee
          </h2>
          <h2
            onClick={() => setActivePage("customer")}
            className={activePage === "customer" ? "active" : ""}
          >
            Customer
          </h2>
          <h2
            onClick={() => setActivePage("sales-report")}
            className={activePage === "sales-report" ? "active" : ""}
          >
            Sales Report
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activePage === "dashboard" && (
          <>
            {/* Top Header with Notification Bell */}
            <div className="content-header">
              <div className="header-title">
                <h1>DASHBOARD</h1>
              </div>
              <NotificationBell />
            </div>

            {/* Search Bar */}
            <div className="search-container1">
              <div className="search-bar1">
                <FaSearch className="search-icon1" />
                <input
                  type="text"
                  placeholder="Search products or customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Swiper Section */}
            <div className="swiper-section">
              <Swiper
                spaceBetween={30}
                slidesPerView={1}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                modules={[Autoplay]}
                className="perfume-swiper"
              >
                {featuredPerfumes.map((perfume) => (
                  <SwiperSlide key={perfume._id}>
                    <div className="perfume-card">
                      <img src={perfume.image} alt={perfume.name} />
                      <div className="perfume-info">
                        <h3>{perfume.name}</h3>
                        <p>{perfume.description}</p>
                        <div className="price">
                          ₹{perfume.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Recent Purchases */}
            <div className="purchases-section">
              <h2>Recent Purchases</h2>
              <div className="purchases-table-container">
                <table className="purchases-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Price (₹)</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase, i) => (
                      <tr key={i}>
                        <td>#{purchase.id}</td>
                        <td>{purchase.product}</td>
                        <td>{purchase.customer}</td>
                        <td>₹{purchase.price.toLocaleString("en-IN")}</td>
                        <td>{purchase.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ✅ Other Pages */}
        {activePage === "inventory" && <Inventory />}
        {activePage === "billing" && <Billing />}
        {activePage === "employee" && <Employee />}
        {activePage === "customer" && <Customer />}
        {activePage === "sales-report" && <SalesReport />}
      </div>
    </div>
  );
};

export default Dashboard;
