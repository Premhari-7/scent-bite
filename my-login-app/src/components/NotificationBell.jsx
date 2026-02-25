import React, { useState, useEffect, useRef } from "react";
import { FaBell } from "react-icons/fa";

const NotificationBell = () => {
  const [products, setProducts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [stockToAdd, setStockToAdd] = useState("");
  const popupRef = useRef(null);
  const bellRef = useRef(null); // NEW

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Filter products with stock < 15
  const lowStockProducts = products.filter((product) => product.stock <= 5);

  // Handle Save Stock Update
  const handleSaveStock = async (productId) => {
    if (!stockToAdd || isNaN(stockToAdd)) return alert("Enter a valid number");

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stockToAdd: parseInt(stockToAdd, 10) }), // increment stock
        }
      );

      if (response.ok) {
        await fetchProducts(); // refresh list
        setEditingProductId(null);
        setStockToAdd("");
      } else {
        console.error("Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  return (
    <div style={{ position: "relative" }}>
      {/* Bell */}
      <div
        ref={bellRef} // ✅ attach ref
        className="notification-bell"
        onClick={() => setShowPopup((prev) => !prev)} // ✅ toggle properly
        style={{ position: "relative", cursor: "pointer" }}
      >
        <FaBell className="bell-icon" size={24} />
        {lowStockProducts.length > 0 && (
          <span className="notification-count">{lowStockProducts.length}</span>
        )}
      </div>

      {/* Popup */}
      {showPopup && (
        <div
          ref={popupRef}
          className="popup"
          style={{
            position: "absolute",
            top: "25px",
            right: "10px",
            color: "#000000ff",
            background: "#fff",
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
            width: "350px",
            maxHeight: "400px",
            overflowY: "auto",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          {lowStockProducts.length === 0 ? (
            <p>No products are out of stock or less than 5</p>
          ) : (
            <div>
              <h4>Low Stock Products</h4>
              {lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  style={{
                    borderBottom: "1px solid #eee",
                    padding: "10px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {/* Product Image */}
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />

                    {/* Product Info */}
                    <div style={{ flex: 1 }}>
                      <p>
                        <strong>{product.name}</strong>
                      </p>
                      <p>Price: ₹{product.price}</p>
                      <p>Stock left: {product.stock}</p>
                    </div>
                  </div>

                  {/* Add Stock Section */}
                  {editingProductId === product._id ? (
                    <div style={{ marginTop: "8px" }}>
                      <input
                        type="number"
                        value={stockToAdd}
                        onChange={(e) => setStockToAdd(e.target.value)}
                        placeholder="Enter stock to add"
                        style={{
                          padding: "5px",
                          marginRight: "8px",
                          width: "120px",
                        }}
                      />
                      <button
                        onClick={() => handleSaveStock(product._id)}
                        style={{
                          background: "green",
                          color: "#fff",
                          padding: "5px 10px",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingProductId(null);
                          setStockToAdd("");
                        }}
                        style={{
                          background: "gray",
                          color: "#fff",
                          padding: "5px 10px",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          marginLeft: "5px",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingProductId(product._id)}
                      style={{
                        marginTop: "8px",
                        background: "blue",
                        color: "#fff",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Add Stock
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
